# AUDITORÍA TÉCNICA — bunker-prototipos
**Fecha:** 2026-05-10
**Auditor:** Claude Code (Auditor Principal del Búnker)
**Scope:** Repositorio completo pre-dockerización

---

## ALERTAS ROJAS

### 1. CONEXIONES SUPABASE

**R1-S1 — `lib/supabase.js` línea 4-8: `supabaseAdmin` sin Supavisor/pgBouncer**
`createClient()` con service role key sin configuración de pooling. Con tráfico concurrente en Docker agota el pool de conexiones de Supabase (límite 60 Free / 200 Pro).

**R1-S2 — `app/api/health/route.js` líneas 1-16: `handleCORS` reimplementada localmente**
Duplicación de `lib/cors.js`. Patrón de divergencia que a futuro lleva a instanciar clientes Supabase fuera del singleton.

**R1-S3 — `contexts/AuthContext.js` líneas 56-63: fallo silencioso si el módulo `lib/supabase.js` falla en carga**
El `catch` silencia el error con `console.warn`, dejando `supabaseBrowser = null` sin log estructurado en Supabase.

**R1-S4 — Ausencia de Supavisor en todas las rutas API**
Ningún `app/api/*/route.js` configura URL de conexión vía Supavisor. No bloqueante ahora, pero debe resolverse antes de dockerizar.

---

### 2. ERROR HANDLING

**R2-E1 — 9 de 11 rutas API exponen `error.message` directamente al cliente (status 500)**

Archivos afectados:
- `app/api/save-result/route.js` línea 97
- `app/api/results/route.js` línea 40
- `app/api/corrections/route.js` líneas 39 y 88
- `app/api/export-csv/route.js` línea 38
- `app/api/consumption/route.js` líneas 53 y 78
- `app/api/precision-stats/route.js` línea 72
- `app/api/request-parental-consent/route.js` líneas 58 y 85
- `app/api/invite-teacher/route.js` línea 75

Filtran nombres de tablas, constraints y detalles de schema PostgreSQL al cliente.

**R2-E2 — `app/api/import-pdf/route.js` líneas 75-82: loop `while (hasMorePages)` sin catch externo**
Errores distintos a "no more pages" terminan silenciosamente con `pageImages = []`. No se loguea en `alertas_log`.

**R2-E3 — `app/api/import-pdf/route.js` líneas 108-115: `continue` silencioso en upload a Storage**
Fallo de subida a Supabase Storage ignorado. El cliente recibe `pagesExtracted: N` aunque se perdieran páginas. **Pérdida de datos silenciosa.**

**R2-E4 — `app/api/grade/route.js` líneas 65-72: `catch` sin variable en parser JSON de respuesta IA**
Solo captura 200 chars del contenido. No escribe en `audit_log` que la corrección falló.

**R2-E5 — `lib/rateLimit.js`: `Map` en memoria, incompatible con múltiples réplicas Docker**
En N réplicas el límite efectivo es `30 * N` peticiones/hora. Fallo silencioso del control de abuso.

---

### 3. ACOPLAMIENTO UI/BACKEND

**R3-U1 — `contexts/AuthContext.js` líneas 56-63: query `.from('teachers').select('*, schools(*)')` en código `'use client'`**
Lógica de carga de datos de usuario acoplada al contexto React. Debe delegarse a `/api/me`.

**R3-U2 — `app/dashboard/rubrics/page.js` líneas 17-33: datos mock hardcoded con `// TODO: Fetch from API`**
La tabla `rubrics` de Supabase no tiene endpoint de lectura. Pantalla sin backend real.

**R3-U3 — `components/OnboardingWizard.js` líneas 62-66: `handleFinish` con `console.log` + `alert`, sin envío a API**
Captura schoolName, CIF/NIF, dpoEmail, adminName, adminEmail y **no los envía a ningún sitio**. `console.log` expone datos sensibles en DevTools del navegador.

**R3-U4 — `app/dashboard/settings/page.js` líneas 9-18: configuración persistida en `localStorage` sin cifrado**
Incompatible con modelo multi-tenant Docker. La configuración debe vivir en Supabase.

**R3-U5 — `app/dashboard/school/page.js` líneas 36-39: `setTimeout` falso, no guarda nada**
Formulario con CIF/NIF, dirección, DPO email simula guardado. No existe `POST /api/update-school`.

**R3-U6 — `app/consent/[consentId]/page.js` líneas 28-49: datos mock + `setTimeout` en confirmación de consentimiento**
Un padre que accede al link de consentimiento NO actualiza `consents.given_at` en la base de datos. **Fallo legal LOPDGDD Art. 92.**

**R3-U7 — `lib/cors.js` línea 6: `Access-Control-Allow-Origin: '*'` por defecto**
Sin `CORS_ORIGINS` configurado en Docker, todas las APIs aceptan peticiones cross-origin desde cualquier dominio.

---

### 4. SEGURIDAD

**R4-SEC1 — `app/api/save-result/route.js` líneas 14-29: inputs sin sanitización antes de insertar en Supabase**
`studentName`, `studentGroup`, `subject`, `questions` llegan directos al `.insert()`. Vector XSS en `studentName`/`studentGroup`. No se invoca `lib/sanitize.js`.

**R4-SEC2 — NINGUNA ruta API verifica sesión de usuario ← FALLO MÁS GRAVE**

Endpoints completamente públicos sin autenticación:
- `POST /api/save-result` — cualquiera puede insertar resultados falsos
- `GET /api/results` — lee resultados de **todos** los centros
- `GET /api/export-csv` — exporta todo el dataset
- `POST /api/corrections` — modifica correcciones
- `GET /api/generate-ropa?schoolId=...` — extrae CIF/NIF, dirección, DPO email de cualquier centro
- `POST /api/import-pdf` — consume Supabase Storage sin límite
- `GET /api/precision-stats`, `GET /api/consumption`

**R4-SEC3 — `lib/supabase.js` línea 5: `supabaseAdmin` (service role) usado en todas las rutas sin RLS**
Bypassa todas las políticas RLS. Con R4-SEC2, `/api/results` devuelve registros de **todos** los centros sin filtrar por `school_id`. Las políticas RLS definidas en los `.sql` son completamente ineficaces.

**R4-SEC4 — `app/api/invite-teacher/route.js` líneas 22-24: sin verificación de rol admin del centro**
Cualquier actor puede registrar emails como profesores en cualquier centro conociendo su UUID.

**R4-SEC5 — `app/api/request-parental-consent/route.js` y `app/api/corrections/route.js`: inputs sin sanitización**
`studentName`, `parentEmail`, `originalText`, `correctedText` insertan directo a Supabase sin pasar por `lib/sanitize.js`.

**R4-SEC6 — `lib/email.js` línea 14: nombre de estudiante y email de padre impresos en stdout en staging**
En entornos sin `RESEND_API_KEY`, datos personales de menores aparecen en logs del contenedor Docker.

**R4-SEC7 — `lib/serverAuth.js` NO EXISTE ← RAÍZ DE R4-SEC2**
El archivo de validación de auth server-side no está implementado. Bloqueante absoluto para dockerización.

**R4-SEC8 — `app/api/grade/route.js` líneas 82-89: `EMERGENT_LLM_KEY` sin validación de presencia**
Si la variable no está definida, el header es `Bearer undefined` y el error 401 se propaga al cliente.

---

## PLAN DE MODULARIZACIÓN

### R4-SEC7 + R4-SEC2 → Crear `lib/serverAuth.js`
**Skill destino:** `lib/`

Extraer JWT del header `Authorization: Bearer <token>`, verificar con `supabaseAdmin.auth.getUser(token)`, devolver `{ user, teacher, school }` o lanzar `AuthError`. Importar y llamar `verifySession(request)` al inicio de todas las rutas protegidas. Reemplazar `supabaseAdmin` en `results/` y `export-csv/` por cliente con JWT del usuario para activar RLS real.

**Dependencias nuevas:**
- Política RLS en `exam_results`: `school_id = auth.jwt() -> school_id`
- Alerta Matrix TECNICA: "Auth layer missing — all API routes publicly accessible"

---

### R4-SEC1 + R4-SEC5 → Sanitización universal de inputs
**Skill destino:** `lib/sanitize.js`

Añadir `sanitizeConsentData()` y `sanitizeCorrectionData()`. Aplicar en `save-result/route.js` (líneas 14-29), `request-parental-consent/route.js` y `corrections/route.js` antes de cada `.insert()`.

**Dependencias nuevas:** Ninguna.

---

### R2-E1 → Crear `lib/apiError.js`
**Skill destino:** `lib/`

Función `safeErrorResponse(error, status=500)` que loguea internamente y devuelve `{ error: 'Error interno. ID: <uuid>' }`. Reemplazar los 9 `NextResponse.json({ error: error.message })`.

**Dependencias nuevas:**
- Usar tabla `alertas_log` con `action = 'SERVER_ERROR'`
- Alerta Matrix TECNICA: "Stack trace leakage in 9 API routes"

---

### R1-S1 + R2-E5 → Connection pooling + rate limiting distribuido
**Skill destino:** `lib/`

1. Configurar Supavisor en `supabaseAdmin`: `SUPABASE_POOLER_URL` con `db: { poolTimeout: 20 }`
2. Reemplazar `Map` en `lib/rateLimit.js` por tabla Supabase `rate_limits (key TEXT PK, count INT, reset_at TIMESTAMPTZ)` con upsert atómico, o Redis (ya activo en Falkenstein).

**Dependencias nuevas:**
- Nueva tabla `rate_limits` con TTL vía `pg_cron`
- Variable de entorno `SUPABASE_POOLER_URL`

---

### R3-U3 + R3-U5 + R3-U6 → Completar Server Actions faltantes
**Skill destino:** `app/api/` (nuevas rutas)

1. `app/api/school/route.js` — `GET/PUT` para school settings
2. `app/api/rubrics/route.js` — `GET/POST/PUT/DELETE`
3. `app/api/onboarding/route.js` — crear school + admin + rubric en transacción
4. `app/api/consents/[id]/confirm/route.js` — `UPDATE consents SET given_at = NOW()`

**Dependencias nuevas:**
- Alerta Matrix LEGAL: "Consent confirmation not persisted — LOPDGDD Art. 92 compliance broken" ← **inmediata**

---

### R3-U4 → Migrar `localStorage` a Supabase
**Skill destino:** `lib/` + `app/api/preferences/route.js`

Nueva tabla `user_preferences (user_id UUID PK, settings JSONB)`. Reemplazar `localStorage.get/set` en `dashboard/settings/page.js`.

---

### R1-S2 + R4-SEC6 → Correcciones puntuales
**Skill destino:** `lib/`

1. `health/route.js`: eliminar `handleCORS` local, importar `@/lib/cors`
2. `lib/email.js`: en bloque mock, `console.log('[EMAIL MOCK] Subject: ' + subject)` — sin destinatario ni cuerpo

---

## Estado por skill para dockerización

| Skill | Estado | Bloqueante principal |
|---|---|---|
| `skill-reservas` (grade + save-result + results) | Funcional, sin auth | R4-SEC2, R4-SEC1 |
| `skill-pagos` (consumption + pricing) | Funcional parcial | R4-SEC2, R3-U3 |
| `skill-policia` (school + invite-teacher) | Shell en UI | R4-SEC2, R4-SEC4, R3-U5 |
| `skill-firma` (consent + parental-consent) | **Shell completo — no persiste nada** | R3-U6, R4-SEC2 — **LEGAL crítico** |

**Bloqueante absoluto para cualquier dockerización:** R4-SEC7 (`lib/serverAuth.js` no existe). Sin eso, exponer cualquier skill en bunker-net equivale a una API pública sin autenticación.
