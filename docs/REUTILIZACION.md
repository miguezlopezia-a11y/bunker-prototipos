# REUTILIZACIÓN — bunker-prototipos
*Generado: 2026-05-10 | Stack: Next.js 14 + Supabase + Tailwind*

---

## 1. REUTILIZABLE SIN CAMBIOS

> Archivos que se copian tal cual a cualquier nicho. Cero modificaciones.

### `lib/supabase.js`
**Función:** Instancia el cliente Supabase en dos modos: `supabaseAdmin` (service role, bypassa RLS) y `supabaseBrowser` (anon key, respeta RLS).
**Por qué reutilizable:** Cero referencias a dominio. Lee únicamente variables de entorno estándar (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Patrón idéntico en cualquier proyecto Supabase.
**Coste Kimi:** 0 min

---

### `lib/cors.js`
**Función:** Helpers `handleCORS`, `corsResponse` y `handleOPTIONS` para añadir cabeceras CORS a respuestas de API Routes de Next.js.
**Por qué reutilizable:** Sin dependencias de dominio. Lee `process.env.CORS_ORIGINS`. Funciona tal cual en cualquier API Route.
**Coste Kimi:** 0 min

---

### `lib/rateLimit.js`
**Función:** Rate limiter en memoria por IP/ruta con ventana configurable. Devuelve `{ allowed, remaining, resetIn }`.
**Por qué reutilizable:** El mapa de rutas (`RATE_LIMIT_CONFIG`) contiene rutas del dominio actual (`/api/grade`, `/api/save-result`) pero el mecanismo es completamente genérico. Sin embargo, las rutas no hacen fallar el archivo si no existen — simplemente usa el `default`. Se puede copiar sin tocar nada y añadir las rutas del nicho después. El motor del algoritmo (ventana deslizante, cleanup por interval) no tiene ninguna dependencia de dominio.
**Por qué reutilizable:** Patrón genérico de sliding window sin dependencias externas.
**Coste Kimi:** 0 min

---

### `lib/sanitize.js` — parcial
**Función:** `sanitizeHTML` y `sanitizePromptInjection` sanitizan inputs para prevenir XSS e inyección de prompts.
**Por qué reutilizable:** `sanitizeHTML` y `sanitizePromptInjection` son completamente genéricas. `sanitizeStudentData` tiene nombres de campo de dominio educativo (`studentName`, `studentGroup`, `subject`, `gradeLevel`, `rubric`) pero es una función de 6 líneas fácil de ignorar o reemplazar.
**Coste Kimi:** 0 min

---

### `lib/fileValidation.js`
**Función:** Valida subidas de imagen (MIME type, tamaño, magic bytes). `sanitizeFilename` elimina path traversal y caracteres peligrosos.
**Por qué reutilizable:** Completamente genérico. Sin referencias a dominio. Útil en cualquier nicho que acepte subidas de archivos.
**Coste Kimi:** 0 min

---

### `lib/utils.js` — parcial
**Función:** `cn()` (clsx + tailwind-merge), `formatDate()` (fecha en `es-ES`), `getGradeColor()` y `getGradeLabel()`.
**Por qué reutilizable:** `cn()` y `formatDate()` son universales. `getGradeColor()` y `getGradeLabel()` son específicas de notas 0–10 (hostelería, clínicas, academias pueden o no necesitarlas). Se copia el archivo entero; las funciones de nota se ignoran si el nicho no las usa.
**Coste Kimi:** 0 min

---

### `hooks/use-mobile.jsx`
**Función:** Hook React que detecta si el viewport es móvil (< 768 px) mediante `matchMedia`.
**Por qué reutilizable:** Sin dependencias de dominio. Patrón shadcn/ui estándar.
**Coste Kimi:** 0 min

---

### `hooks/use-toast.js`
**Función:** Sistema de toasts en memoria (reducer + listeners) con API `useToast()` y `toast()`.
**Por qué reutilizable:** Generado por shadcn/ui. Cero referencias de dominio. Copy-paste literal entre proyectos.
**Coste Kimi:** 0 min

---

### `components/ui/*` (38 archivos)
**Función:** Librería completa de componentes shadcn/ui: `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle`, `toggle-group`, `tooltip`.
**Por qué reutilizable:** Componentes primitivos de Radix UI envueltos con Tailwind. Cero lógica de dominio. Se instalan/copian tal cual en cualquier proyecto con el mismo `components.json`.
**Coste Kimi:** 0 min

---

### `components.json`
**Función:** Configuración de shadcn/ui: estilo `new-york`, color base `slate`, aliases de rutas.
**Por qué reutilizable:** Configuración estándar de shadcn/ui. Funciona en cualquier proyecto con la misma estructura de carpetas.
**Coste Kimi:** 0 min

---

### `jsconfig.json`
**Función:** Define alias `@/*` para rutas absolutas en el proyecto.
**Por qué reutilizable:** Configuración estándar de Next.js. Sin referencias a dominio.
**Coste Kimi:** 0 min

---

### `tailwind.config.js`
**Función:** Configura Tailwind con variables CSS de shadcn/ui, colores semánticos (`primary`, `secondary`, `destructive`, etc.), `borderRadius`, animaciones de accordion y plugin `tailwindcss-animate`.
**Por qué reutilizable:** Configuración estándar de shadcn/ui. Sin colores de marca hardcodeados (usa variables CSS). Idéntico entre proyectos del mismo stack.
**Coste Kimi:** 0 min

---

### `postcss.config.js`
**Función:** Configura PostCSS con `tailwindcss` y `autoprefixer`.
**Por qué reutilizable:** Archivo de 2 líneas, estándar de Next.js + Tailwind.
**Coste Kimi:** 0 min

---

### `components/SessionTimeout.js`
**Función:** Componente invisible que cierra sesión automáticamente tras N minutos de inactividad (eventos: `mousedown`, `keydown`, `scroll`, `touchstart`, `click`). Muestra advertencia 2 minutos antes.
**Por qué reutilizable:** Sin referencias a dominio. Depende únicamente de `AuthContext` (genérico) y `next/navigation`. El tiempo de timeout es configurable via props. Patrón aplicable a cualquier nicho con requisitos de seguridad de sesión.
**Coste Kimi:** 0 min

---

### `components/CookieBanner.js`
**Función:** Banner RGPD de cookies que persiste la elección en `localStorage` (`'all'` / `'essential'`). Enlaza a `/legal/privacy`.
**Por qué reutilizable:** Sin referencias a dominio educativo. El texto menciona "cookies esenciales y analíticas" de forma genérica. Válido para cualquier nicho español/europeo que requiera cumplimiento RGPD.
**Coste Kimi:** 0 min

---

### `app/api/health/route.js` — motor
**Función:** Endpoint `GET /api/health` que devuelve `{ status: 'ok', service, database, version }`.
**Por qué reutilizable:** El patrón de health check es completamente genérico. Solo el valor de `service` contiene texto de dominio.
**Coste Kimi:** 0 min *(con la salvedad de la adaptación del campo `service`, que es 1 línea — ver sección 2)*

---

### `lib/auditLog.js` — motor de escritura
**Función:** `writeAuditLog()` escribe en la tabla `audit_log` de Supabase. `getClientIP()` extrae IP de cabeceras HTTP (X-Forwarded-For, CF-Connecting-IP). El objeto `AuditActions` es un catálogo de constantes de acción.
**Por qué reutilizable:** `writeAuditLog()` y `getClientIP()` son completamente genéricos; la tabla `audit_log` tiene campos universales (`user_id`, `action`, `affected_table`, `ip_address`, `metadata` JSONB). `AuditActions` contiene constantes del dominio educativo pero no afecta a la funcionalidad — simplemente se extiende/sustituye para el nicho nuevo.
**Coste Kimi:** 0 min *(el catálogo `AuditActions` se adapta en 5 min — ver sección 2)*

---

## 2. REUTILIZABLE CON ADAPTACIÓN

> Archivos que necesitan cambios. Se reutiliza la estructura, se adapta el dominio.

---

### `next.config.js`
**Función:** Configuración de Next.js: output standalone, headers de seguridad (CSP, HSTS, X-Frame-Options, Referrer-Policy), watch options para dev.
**Qué permanece:** Todos los headers de seguridad, standalone output, webpack watch options, `onDemandEntries`. Es un template de seguridad completo y reutilizable.
**Qué cambia:**
- Línea 3: `serverComponentsExternalPackages: ['mongodb']` — eliminar si no se usa MongoDB (este proyecto no lo usa; es un residuo del template).
- Headers de CORS leen `process.env.CORS_ORIGINS` — sin cambios en código, solo en `.env`.
**Coste Kimi:** 5 min

---

### `package.json`
**Función:** Dependencias del proyecto. Stack: Next.js 14, Supabase, Radix UI, Tailwind, Resend, pdf2pic, sharp, recharts, react-hook-form, zod, lucide-react.
**Qué permanece:** El núcleo del stack (Next.js, Supabase, shadcn/ui, Tailwind, Resend, zod, react-hook-form) es reutilizable en cualquier nicho.
**Qué cambia:**
- `"name": "nextjs-mongo-template"` → cambiar al nombre del nicho (línea 2).
- Dependencias específicas del dominio educativo que pueden eliminarse si el nicho no las usa: `pdf2pic`, `jspdf`, `jspdf-autotable` (solo si no hay generación de PDF/importación de PDF), `recharts` (solo si no hay gráficas estadísticas).
- Añadir dependencias específicas del nicho nuevo.
**Coste Kimi:** 5 min

---

### `app/layout.js`
**Función:** Root layout de Next.js. Envuelve con `AuthProvider` y `CookieBanner`. Define metadatos (`<title>`, `<meta name="description">`, PWA manifest, theme-color).
**Qué permanece:** Estructura del layout, `AuthProvider`, `CookieBanner`, font Inter, clase `bg-slate-50 min-h-screen`.
**Qué cambia:**
- Línea 16: `<title>Corrector de Exámenes</title>` → `<title>[Nombre del nicho]</title>`
- Línea 17: `content="Corrige exámenes con inteligencia artificial"` → descripción del nicho.
- Línea 19: `content="#1e40af"` (azul) → color de marca del nicho.
- Línea 22: `content="Corrector"` → nombre corto del nicho.
**Coste Kimi:** 5 min

---

### `app/globals.css`
**Función:** Variables CSS de shadcn/ui (colores semánticos en HSL para modo claro/oscuro), estilos base (`@layer base`).
**Qué permanece:** Sistema completo de variables CSS de shadcn/ui, dark mode, scrollbar styling.
**Qué cambia:** Los valores HSL de `--primary` y `--sidebar-primary` definen el color principal de la UI (actualmente azul `222.2 47.4% 11.2%`). Para cambiar la paleta de un nicho, modificar únicamente los valores de `--primary`, `--primary-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground` en `:root` y `.dark`.
**Coste Kimi:** 5 min

---

### `contexts/AuthContext.js`
**Función:** Context React que gestiona autenticación via Supabase Auth (email/password). Expone `user`, `teacher`, `school`, `loading`, `signIn`, `signOut`.
**Qué permanece:** Estructura completa del context (provider, hook, gestión de sesión, listener `onAuthStateChange`, degradado graceful cuando Supabase no está configurado).
**Qué cambia:**
- Línea 47: `.from('teachers').select('*, schools(*)')` → cambiar `'teachers'` al nombre de la tabla de usuarios del nicho (ej. `'staff'`, `'users'`, `'empleados'`) y `'schools(*)'` al nombre de la entidad organizativa (ej. `'clinicas(*)'`, `'academias(*)'`).
- Línea 50–51: `setTeacher(teacherData)` y `setSchool(teacherData.schools)` → renombrar variables según el nicho. Solo afecta al naming interno.
- El objeto `value` exportado (línea 70–78) expone `teacher` y `school` — se renombran las claves si el nicho lo requiere.
**Coste Kimi:** 5 min

---

### `components/DashboardLayout.js`
**Función:** Layout del dashboard con sidebar fijo. Incluye navegación, badge de precisión OCR (métrica del mes), info de usuario, botón de logout y `SessionTimeout`.
**Qué permanece:** Estructura sidebar + contenido principal, patrón de navegación con `pathname` activo, `SessionTimeout`, integración con `AuthContext`.
**Qué cambia:**
- Líneas 15–26: Array `navigation` — cambiar nombres, rutas e iconos según las secciones del nicho.
- Líneas 11–14: Imports de iconos (`GraduationCap`, `BookOpen`, `Target`, etc.) → sustituir por iconos acordes al nicho.
- Línea 45 (`fetch('/api/precision-stats')`): el badge de precisión OCR es específico del corrector. Para otros nichos: eliminar el bloque `useEffect` de `precisionBadge` (líneas 43–54) y el JSX del badge (líneas 75–90).
- Línea 63: `<GraduationCap className="w-8 h-8 text-blue-600" />` → icono del nicho.
- Línea 65: `<h1>Corrector IA</h1>` → nombre de la aplicación del nicho.
**Coste Kimi:** 15 min

---

### `app/login/page.js`
**Función:** Página de login con formulario email/contraseña. Usa `AuthContext.signIn()`. Incluye enlaces a `/legal/privacy` y `/legal/terms`.
**Qué permanece:** Estructura completa del formulario, manejo de errores, loading state, integración con AuthContext.
**Qué cambia:**
- Línea 26: `<GraduationCap>` → icono del nicho.
- Línea 28: `"Corrector IA"` → nombre del nicho.
- Línea 29: `"Sistema de corrección inteligente"` → tagline del nicho.
- Línea 53: `placeholder="profesor@colegio.es"` → email de ejemplo del nicho.
- Línea 67: `"Acceso restringido a profesores autorizados"` → texto del nicho.
- Línea 69: `href="mailto:soporte@colegio.es"` → email de soporte del nicho.
**Coste Kimi:** 5 min

---

### `app/onboarding/page.js`
**Función:** Página que renderiza `<OnboardingWizard />`. Actúa como shell de ruta.
**Qué permanece:** Estructura mínima de página Next.js App Router.
**Qué cambia:** Solo el componente importado si el wizard cambia de nombre.
**Coste Kimi:** 5 min

---

### `app/pricing/page.js`
**Función:** Página de pricing que muestra los 3 tiers (Básico/Profesional/Institucional) con precios, cuotas y comparación de características. Consume `lib/pricing.js`.
**Qué permanece:** Estructura de la página de precios (3 columnas, tabla comparativa, CTA), patrón de UI con shadcn/ui cards.
**Qué cambia:** Todos los textos de características, nombres de planes y propuesta de valor dependen del nicho. Requiere reescribir el contenido de las tarjetas pero no la estructura. Ver también `lib/pricing.js` para los valores numéricos.
**Coste Kimi:** 30 min

---

### `lib/pricing.js`
**Función:** Define `PRICING_TIERS` (3 niveles con precio, cuota, nombre, descripción) y funciones `calculateMonthlyCost()` y `getQuotaForTier()`.
**Qué permanece:** Patrón de pricing híbrido (cuota mensual + overage por unidad), funciones de cálculo.
**Qué cambia:**
- Líneas 3–21: Objeto `PRICING_TIERS` — cambiar `name`, `price`, `quota`, `target`, `description` para el nicho.
- Línea 23: `OVERAGE_PRICE_PER_PAGE` → renombrar a `OVERAGE_PRICE_PER_UNIT` y ajustar valor.
- La métrica de consumo (`pages`) es específica del corrector — renombrar a la unidad del nicho (reservas, consultas, clases, etc.) en los comentarios y nombres de variable.
**Coste Kimi:** 15 min

---

### `lib/email.js`
**Función:** Módulo de emails (Resend). Tres templates: `sendTeacherInvitation`, `sendParentalConsentRequest`, `sendRetentionPolicyAlert`. La función base `sendEmail()` es genérica.
**Qué permanece:** `sendEmail()` base completamente genérica. Patrón de degradado graceful cuando `RESEND_API_KEY` no está configurado. Sistema de templates HTML responsive.
**Qué cambia:**
- `FROM_EMAIL` (línea 9): `'Corrector de Exámenes <noreply@corrector-examenes.es>'` → email del nicho.
- `sendTeacherInvitation()` → renombrar a `sendUserInvitation()` y cambiar textos del template.
- `sendParentalConsentRequest()` → específico de menores de edad (LOPDGDD Art. 92). Solo reutilizable en nichos con menores. Descartar o renombrar para consentimientos genéricos.
- `sendRetentionPolicyAlert()` → texto específico de exámenes (24 meses). Actualizar plazo y terminología del nicho.
**Coste Kimi:** 15 min

---

### `lib/auditLog.js` — catálogo `AuditActions`
**Función:** El objeto `AuditActions` define constantes de tipos de acción auditables.
**Qué permanece:** `writeAuditLog()` y `getClientIP()` son completamente reutilizables (ver sección 1). Solo el catálogo necesita adaptación.
**Qué cambia:**
- Líneas 32–57: Objeto `AuditActions` — reemplazar acciones específicas de exámenes (`GRADE_EXAM`, `SAVE_EXAM_RESULT`, `CREATE_RUBRIC`, etc.) con las acciones del nicho. La estructura (`NOMBRE_ACCION: 'nombre_accion'`) no cambia.
**Coste Kimi:** 5 min

---

### `lib/transforms.js`
**Función:** `transformResult()` convierte una fila de Supabase (`snake_case`) a objeto camelCase para el frontend.
**Qué permanece:** Patrón de transformación row→frontend con parseFloat seguro y valores por defecto.
**Qué cambia:** Todos los campos son específicos del dominio educativo (`student_name`, `student_group`, `subject`, `level`, `grade`, `max_grade`, `feedback`, `ocr_confidence`, `wizard_config`). Para otro nicho se reescribe completamente con los campos de su tabla principal, manteniendo el patrón de transformación.
**Coste Kimi:** 15 min

---

### `app/api/health/route.js`
**Función:** Health check endpoint.
**Qué permanece:** Estructura del endpoint, manejo CORS, patrón de respuesta.
**Qué cambia:**
- Línea 15: `service: 'Corrector de Examenes'` → nombre del nicho.
- Línea 16: `version: '2.0.0'` → versión actual del nicho.
**Coste Kimi:** 5 min

---

### `app/api/results/route.js`
**Función:** `GET /api/results` — lista registros de la tabla principal con filtros (subject, dateFrom, dateTo, studentName) y calcula estadísticas (avgGrade, avgConfidence).
**Qué permanece:** Patrón completo de API Route: query builder con filtros opcionales, paginación, cálculo de estadísticas agregadas, integración con `transformResult` y `handleCORS`.
**Qué cambia:**
- Línea 20: `.from('exam_results')` → `.from('<tabla_nicho>')`.
- Líneas 23–26: Filtros (`subject`, `dateFrom`, `dateTo`, `studentName`) → nombres de columnas del nicho.
- Líneas 33–38: Cálculo de `avgGrade` y `avgConfidence` → métricas relevantes del nicho.
- Import de `transformResult` → función transform del nicho.
**Coste Kimi:** 15 min

---

### `app/api/export-csv/route.js`
**Función:** `GET /api/export-csv` — exporta hasta 1000 registros de `exam_results` con filtros a un CSV con BOM UTF-8 para Excel. Incluye audit log.
**Qué permanece:** Patrón completo de export CSV: aplicación de filtros, generación de CSV con BOM, escape de campos, formato de fecha, audit log, cabeceras HTTP correctas (`Content-Disposition`).
**Qué cambia:**
- Líneas 19–28: Filtros y query → tabla y columnas del nicho.
- Líneas 47–64: Función `generateCSV()` — cabeceras del CSV y mapeo de campos → especificar columnas del nicho.
- Línea 67: Nombre del archivo descargado `examenes_${fecha}` → `<entidad_nicho>_${fecha}`.
- Línea 55: `const aiModel = 'GPT-4o'` → eliminar o sustituir.
**Coste Kimi:** 15 min

---

### `app/api/save-result/route.js`
**Función:** `POST /api/save-result` — inserta un resultado en `exam_results`, registra correcciones AI en `text_corrections` y escribe audit log.
**Qué permanece:** Patrón de insert+audit log, sanitización de `ocr_confidence`, manejo de errores sin romper la operación principal.
**Qué cambia:**
- Líneas 17–21: Campos extraídos del body → campos del nicho.
- Línea 30–44: `.from('exam_results').insert({...})` → tabla y columnas del nicho.
- Líneas 46–60: Bloque de auto-log en `text_corrections` → eliminar o adaptar si el nicho no tiene correcciones AI.
- Líneas 62–68: Bloque de consumption tracking → adaptar a la unidad de consumo del nicho.
**Coste Kimi:** 15 min

---

### `app/api/consumption/route.js`
**Función:** `GET` y `POST /api/consumption` — lee/actualiza la tabla `monthly_consumption` para tracking de cuota mensual por escuela. Calcula alertas al 80% y 95%.
**Qué permanece:** Patrón de upsert de consumo mensual, lógica de alertas porcentuales, cálculo de overage, integración con `lib/pricing.js`.
**Qué cambia:**
- Línea 19–29: `.from('monthly_consumption')` → tabla de consumo del nicho.
- Los campos `pages_processed`, `quota_limit` → renombrar a la unidad del nicho — 8–10 referencias en el archivo.
**Coste Kimi:** 15 min

---

### `app/api/corrections/route.js`
**Función:** `GET` y `POST /api/corrections` — CRUD sobre la tabla `text_corrections` para registrar correcciones (AI o humanas) sobre resultados.
**Qué permanece:** Patrón CRUD con validación de enums, audit log, transformación de row a camelCase en la respuesta.
**Qué cambia:** Específico del corrector de exámenes. En nichos con revisión de contenido se reutiliza adaptando los campos `exam_result_id` → `<entidad_id>` y el nombre de la tabla.
**Coste Kimi:** 30 min (si el nicho necesita un módulo de revisión similar)

---

### `app/api/invite-teacher/route.js`
**Función:** `POST /api/invite-teacher` — invita un usuario via Supabase Auth `inviteUserByEmail`, crea registro en tabla `teachers` y envía email de invitación.
**Qué permanece:** Patrón completo de invitación de usuario: validación de email, check de duplicado, `supabaseAdmin.auth.admin.inviteUserByEmail()`, rollback si falla la inserción, email de bienvenida, audit log.
**Qué cambia:**
- Línea 15: `role = 'teacher'` → rol por defecto del nicho.
- Línea 37: `.from('teachers')` → tabla de usuarios del nicho.
- Línea 54: `.from('teachers').insert({...})` → tabla del nicho.
- Línea 68: `sendTeacherInvitation` → `sendUserInvitation`.
- Línea 69: `schoolName: 'Su Centro Educativo'` → entidad del nicho.
- Renombrar carpeta `invite-teacher` → `invite-user`.
**Coste Kimi:** 15 min

---

### `app/dashboard/settings/page.js`
**Función:** Página de configuración de usuario. Controles: selector de modelo AI, toggles de notificaciones, umbral de alerta, tiempo de sesión. Persiste en `localStorage`.
**Qué permanece:** Patrón de settings con localStorage, toggles, ranges, agrupación en secciones. El `sessionTimeout` es universal.
**Qué cambia:**
- Bloque "Proveedor de IA" → eliminar o sustituir si el nicho no usa modelos AI.
- El `alertThreshold` calibrado para notas 0–10 → adaptar rango al dominio del nicho.
- Textos de etiquetas → terminología del nicho.
**Coste Kimi:** 15 min

---

### `app/dashboard/privacy/page.js`
**Función:** Panel de privacidad RGPD: modo anónimo, política de retención, generador de RoPA (Art. 30 RGPD), derechos del interesado (Art. 20, Art. 17), consentimientos activos, contacto DPO.
**Qué permanece:** Toda la estructura de cumplimiento RGPD es reutilizable en cualquier nicho que opere en España/UE.
**Qué cambia:**
- Descripción del modo anónimo → terminología del nicho.
- Línea 155: `"dpo@colegio.es"` → DPO del nicho.
- Tipos de consentimiento → los del nicho.
**Coste Kimi:** 15 min

---

### `app/api/generate-ropa/route.js`
**Función:** Genera un PDF del Registro de Actividades de Tratamiento (RGPD Art. 30) con jsPDF.
**Qué permanece:** Estructura del documento RoPA, uso de jsPDF, patrón de respuesta con cabeceras PDF.
**Qué cambia:** Todo el contenido del PDF (actividades de tratamiento, categorías de datos, plazos) es específico del dominio educativo. Reescribir contenido para cada nicho manteniendo el esqueleto jsPDF.
**Coste Kimi:** 30 min

---

### `app/api/precision-stats/route.js`
**Función:** `GET /api/precision-stats` — calcula media de `ocr_confidence` del mes actual y anterior.
**Qué permanece:** Patrón de stats agregadas por periodo temporal (mes actual vs. anterior).
**Qué cambia:** Si el nicho no tiene métricas de confianza OCR, descartar o reemplazar por la métrica de calidad equivalente. Todos los campos son específicos del corrector.
**Coste Kimi:** 15 min (si el nicho tiene métrica similar) / descartable si no

---

### `app/api/import-pdf/route.js`
**Función:** `POST /api/import-pdf` — recibe un PDF, lo convierte a JPEG por página (pdf2pic + sharp a 300 DPI), sube a Supabase Storage.
**Qué permanece:** Patrón completo de upload+conversión de PDF: validación, conversión, optimización con sharp, upload a Storage, cleanup de archivos temporales, audit log.
**Qué cambia:**
- Tabla `exam_documents` → `<entidad>_documents` del nicho.
- Tabla `exam_document_pages` → `<entidad>_document_pages`.
- Bucket de Storage `'exam-images'` → bucket del nicho.
- Campos específicos (`wizard_config`, `pages_per_exam`) → campos del nicho.
**Coste Kimi:** 15 min

---

### `app/dashboard/history/page.js`
**Función:** Historial de correcciones con filtros, tabla paginada, acciones por fila, exportación CSV y estadísticas de resumen.
**Qué permanece:** Patrón de lista filtrable + tabla + exportación CSV.
**Qué cambia:** Todos los nombres de columnas, filtros y labels son del dominio educativo. Reescribir columnas y filtros para el nicho manteniendo el patrón.
**Coste Kimi:** 30 min

---

### `app/dashboard/stats/page.js`
**Función:** Dashboard de estadísticas con recharts: distribución de notas, evolución temporal, top asignaturas, precisión OCR.
**Qué permanece:** Patrón de stats dashboard con recharts (BarChart, LineChart, PieChart), fetching, skeleton loaders, cards de KPIs.
**Qué cambia:** Todos los KPIs, gráficas y métricas son del dominio educativo. Sustituir por métricas del nicho (ocupación, ingresos, citas, etc.).
**Coste Kimi:** 30 min

---

### `app/dashboard/school/page.js`
**Función:** Panel de administración del "centro": datos del colegio, gestión de profesores, consumo mensual con barra de progreso.
**Qué permanece:** Patrón de admin panel: CRUD de usuarios, consumo/quota con barra de progreso, edición de datos de la entidad.
**Qué cambia:** Toda la terminología ("Mi Centro", "profesores", "colegio") → terminología del nicho.
**Coste Kimi:** 30 min

---

### `components/OnboardingWizard.js`
**Función:** Wizard multi-paso para configurar el perfil al registro: nombre del centro, nivel educativo, asignaturas, preferencias de corrección.
**Qué permanece:** Patrón de wizard multi-paso con estado, navegación anterior/siguiente, validación por paso, persistencia en Supabase al finalizar.
**Qué cambia:** Todos los pasos y campos son específicos del dominio educativo. Redefinir pasos y campos para el nicho manteniendo el motor del wizard.
**Coste Kimi:** 30 min

---

### `components/ExamConfigWizard.js`
**Función:** Wizard de configuración de examen: tipo, nivel educativo, criterios de evaluación, penalizaciones.
**Qué permanece:** Motor del wizard: pasos, estado, validación, UI con shadcn/ui.
**Qué cambia:** Todos los pasos son específicos del corrector. Para otro nicho usar como base de un wizard de configuración propio.
**Coste Kimi:** 30 min

---

### `lib/promptBuilder.js`
**Función:** Construye prompts para GPT-4o Vision según la configuración del wizard. Define instrucciones de corrección, formato JSON esperado y advertencias RGPD.
**Qué permanece:** Patrón de prompt builder modular con dispatch por segmento, formato JSON de salida estructurado, advertencias LOPDGDD.
**Qué cambia:** Todo el contenido de los prompts es específico del corrector. Para nichos con IA generativa reutilizar el patrón reescribiendo el contenido.
**Coste Kimi:** 30 min por prompt nuevo

---

### `app/legal/privacy/page.js`
**Función:** Política de privacidad completa (RGPD + LOPDGDD) con secciones estándar: responsable, datos recabados, bases legales, plazos de retención, derechos del interesado, DPO.
**Qué permanece:** Estructura legal del documento, referencias normativas (RGPD, LOPDGDD), secciones estándar de política de privacidad española.
**Qué cambia:** Todo el contenido concreto: responsable del tratamiento, tipos de datos, finalidades, plazos, email del DPO, referencias a "exámenes/profesores/alumnos" → terminología del nicho.
**Coste Kimi:** 30 min

---

### `app/legal/terms/page.js`
**Función:** Términos de servicio con secciones: objeto del servicio, condiciones de uso, propiedad intelectual, limitación de responsabilidad, jurisdicción.
**Qué permanece:** Estructura del documento legal, secciones estándar de ToS.
**Qué cambia:** Todo el contenido concreto → terminología del nicho.
**Coste Kimi:** 30 min

---

### `app/consent/[consentId]/page.js`
**Función:** Página pública de otorgamiento de consentimiento parental (LOPDGDD Art. 92, menores de 14 años). Ruta dinámica por token.
**Qué permanece:** Patrón de página de consentimiento tokenizada, lookup por ID en Supabase, registro del consentimiento con timestamp.
**Qué cambia:** Específico de centros educativos con menores. En nichos sin menores se descarta. En nichos con consentimientos RGPD generales (clínicas, etc.) se reutiliza el patrón adaptando los textos.
**Coste Kimi:** 15 min

---

### `components/CorrectionsHistory.js`
**Función:** Historial de correcciones (AI + humanas) para un resultado específico, con detalle por pregunta, fuente de corrección y puntuación de confianza.
**Qué permanece:** Patrón de historial de cambios/auditoría a nivel de entidad individual con timeline.
**Qué cambia:** Toda la terminología (preguntas, correcciones OCR, confianza) es específica del corrector. En nichos con auditoría de cambios reutilizar el patrón.
**Coste Kimi:** 30 min

---

### `app/dashboard/rubrics/page.js`
**Función:** CRUD de rúbricas de evaluación: lista, crear, editar, eliminar.
**Qué permanece:** Patrón CRUD con modal de creación/edición, lista con acciones, integración con Supabase.
**Qué cambia:** "Rúbricas" es específico del dominio educativo. Para otros nichos adaptar a la entidad configurable equivalente: tarifas (hostal), protocolos (clínica), materiales (academia).
**Coste Kimi:** 30 min

---

### `app/dashboard/students/page.js`
**Función:** Vista de progreso por estudiante: agrupa resultados por nombre, calcula media, muestra evolución temporal con gráfica de líneas.
**Qué permanece:** Patrón de agrupación de registros por entidad con estadísticas agregadas y gráfica temporal.
**Qué cambia:** "Estudiante" → entidad del nicho (cliente/paciente/huésped). Las métricas → métricas del nicho.
**Coste Kimi:** 30 min

---

### `app/api/request-parental-consent/route.js`
**Función:** `POST` — genera token de consentimiento, crea registro en Supabase y envía email al padre/madre/tutor.
**Qué permanece:** Patrón de solicitud de consentimiento tokenizada con email y registro en BD.
**Qué cambia:** Específico de menores de edad (LOPDGDD Art. 92). Descartable para nichos sin menores. Adaptable para consentimientos RGPD genéricos.
**Coste Kimi:** 15 min

---

### `app/page.js` (63 KB)
**Función:** Página principal del corrector: área de captura de imagen, configuración rápida, llamada a `/api/grade`, visualización de resultados.
**Qué permanece:** Patrón de página de operación principal con upload de imagen, llamada a API de IA y visualización estructurada del resultado.
**Qué cambia:** Este es el archivo más específico del dominio. Toda la UI es exclusiva del corrector. Para otro nicho se reemplaza completamente por la pantalla de operación principal del nicho.
**Coste Kimi:** 60+ min (reescritura completa)

---

## 3. RESUMEN DE AHORRO

| Categoría | Archivos | Coste de adaptación |
|---|---|---|
| Sin cambios | 18 | 0 min |
| Con adaptación | 29 | ~490 min (~8 h) |
| **Total reutilizable** | **47** | **~490 min de trabajo para Kimi** |

> Sin este prototipo, cada archivo requeriría entre 30 min y 3 h de generación desde cero. El ahorro real estimado es **40–80 h** por nicho nuevo.

---

## NOTAS PARA KIMI

### Orden de trabajo recomendado (9 fases con dependencias)

1. **Infraestructura (0 min):** Copiar `components/ui/`, `lib/supabase.js`, `lib/cors.js`, `lib/rateLimit.js`, `lib/sanitize.js`, `lib/fileValidation.js`, `lib/utils.js`, `hooks/`, `tailwind.config.js`, `jsconfig.json`, `components.json`, `postcss.config.js`.

2. **Auth y contexto (5–15 min):** Adaptar `contexts/AuthContext.js` (nombres de tablas) + `lib/auditLog.js` (catálogo `AuditActions`).

3. **Layout y navegación (15 min):** Adaptar `components/DashboardLayout.js` (array `navigation`) + `app/layout.js` (título, color) + `app/globals.css` (variables `--primary`).

4. **Autenticación (5 min):** Adaptar `app/login/page.js` (textos e icono).

5. **APIs genéricas (5–15 min c/u):** `app/api/health/route.js` + `app/api/invite-teacher/route.js` → `invite-user` + `lib/email.js`.

6. **Entidad principal y CRUD (15–30 min c/u):** `app/api/results/route.js` + `app/api/save-result/route.js` + `app/api/export-csv/route.js` + `lib/transforms.js` + reescribir `app/page.js`.

7. **Pricing y consumo (15–30 min):** `lib/pricing.js` + `app/api/consumption/route.js` + `app/pricing/page.js`.

8. **Páginas legales (30 min c/u):** `app/legal/privacy/page.js` + `app/legal/terms/page.js` + `app/dashboard/privacy/page.js`.

9. **Dashboard secundario (30 min c/u):** `app/dashboard/history/page.js` + `stats/page.js` + `settings/page.js` + `school/page.js` + `components/OnboardingWizard.js`.

### Advertencias críticas

- **`app/page.js` (63 KB):** No adaptar — reescribir desde cero con la misma estructura de componente de operación principal.
- **`lib/promptBuilder.js`:** Solo para nichos con IA generativa. Si no hay IA, descartar.
- **`app/api/import-pdf/route.js`:** Requiere `pdf2pic` y `poppler` instalados en el sistema. Verificar disponibilidad en producción antes de incluir.
- **`app/api/corrections/route.js` y `components/CorrectionsHistory.js`:** Solo para nichos con auditoría de cambios a nivel de ítem. Para nichos simples, descartar.
- **`app/consent/[consentId]/page.js` y `app/api/request-parental-consent/route.js`:** Solo para nichos con menores de 14 años (LOPDGDD Art. 92).
- **Tabla `audit_log`:** Copiar el SQL de `SUPABASE_BOOTSTRAP_COMPLETE.sql` que define la tabla y sus políticas RLS antes de usar `lib/auditLog.js`.
- **Variables de entorno necesarias:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_BASE_URL`, `CORS_ORIGINS`, `EMERGENT_LLM_KEY` (solo si se usa IA).
- **`next.config.js`:** Contiene `serverComponentsExternalPackages: ['mongodb']` — residuo del template. Eliminar en el nicho nuevo.
