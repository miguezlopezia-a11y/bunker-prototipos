import React from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Política de Privacidad</h1>
          </div>

          <p className="text-sm text-slate-600 mb-8">Última actualización: 15 de junio de 2025</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Responsable del Tratamiento</h2>
              <p className="text-slate-700">
                De conformidad con el Reglamento General de Protección de Datos (RGPD - Reglamento UE 2016/679) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), el responsable del tratamiento de sus datos personales es:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Razón social:</strong> [Nombre del Centro Educativo]</li>
                <li><strong>CIF/NIF:</strong> [CIF del Centro]</li>
                <li><strong>Domicilio:</strong> [Dirección completa]</li>
                <li><strong>Email de contacto:</strong> dpo@colegio.es</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Delegado de Protección de Datos (DPO)</h2>
              <p className="text-slate-700">
                Según el Artículo 37 del RGPD, hemos designado un Delegado de Protección de Datos (DPO). Puede contactar con él en: <strong>dpo@colegio.es</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Finalidad del Tratamiento</h2>
              <p className="text-slate-700">Los datos personales recogidos se utilizarán para:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Corrección automatizada de exámenes mediante inteligencia artificial</li>
                <li>Seguimiento del rendimiento académico de los estudiantes</li>
                <li>Generación de estadísticas y análisis educativos</li>
                <li>Gestión de usuarios (profesores) y control de acceso</li>
                <li>Cumplimiento de obligaciones legales (LOPDGDD Art. 83 - sector educativo)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Base Legal (Art. 6 RGPD)</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Consentimiento explícito:</strong> Para el tratamiento de datos de estudiantes y uso de IA</li>
                <li><strong>Interés legítimo:</strong> Evaluación del rendimiento académico (Art. 6.1.f RGPD)</li>
                <li><strong>Cumplimiento legal:</strong> Obligaciones del sector educativo (LOPDGDD Art. 83)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Protección de Menores (LOPDGDD Art. 92)</h2>
              <p className="text-slate-700">
                <strong>⚠️ Tratamiento de datos de menores de 14 años:</strong>
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Se requiere consentimiento de padres/tutores para menores de 14 años</li>
                <li>El sistema NO captura ni almacena fotografías de rostros</li>
                <li>Los modelos de IA están configurados para ignorar información personal visible</li>
                <li>Modo anónimo disponible para corrección sin identificación</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Datos Recogidos</h2>
              <p className="text-slate-700"><strong>Datos de estudiantes:</strong></p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1 mb-3">
                <li>Nombre completo (opcional en modo anónimo)</li>
                <li>Grupo/clase</li>
                <li>Imágenes de exámenes (contenido académico, NO fotografías personales)</li>
                <li>Calificaciones y feedback</li>
              </ul>
              <p className="text-slate-700"><strong>Datos de profesores:</strong></p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Nombre, email, centro educativo</li>
                <li>Credenciales de acceso (contraseñas cifradas)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Conservación de Datos (Art. 5.1.e RGPD)</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Exámenes:</strong> Se conservan durante [24 meses] desde la corrección</li>
                <li><strong>Eliminación automática:</strong> Soft delete después del periodo de retención</li>
                <li><strong>Eliminación definitiva:</strong> Hard delete 30 días después del soft delete</li>
                <li><strong>Logs de auditoría:</strong> Conservados 5 años (cumplimiento legal)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Derechos de los Interesados (Art. 12-23 RGPD)</h2>
              <p className="text-slate-700">Tiene derecho a:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Acceso (Art. 15):</strong> Obtener confirmación y copia de sus datos</li>
                <li><strong>Rectificación (Art. 16):</strong> Corregir datos inexactos</li>
                <li><strong>Supresión / Derecho al Olvido (Art. 17):</strong> Eliminar sus datos</li>
                <li><strong>Limitación (Art. 18):</strong> Restringir el tratamiento</li>
                <li><strong>Portabilidad (Art. 20):</strong> Recibir sus datos en formato JSON/CSV</li>
                <li><strong>Oposición (Art. 21):</strong> Oponerse al tratamiento</li>
              </ul>
              <p className="text-slate-700 mt-3">
                <strong>Para ejercer sus derechos:</strong> Envíe un email a <a href="mailto:dpo@colegio.es" className="text-blue-600 underline">dpo@colegio.es</a> con asunto "Ejercicio de Derechos RGPD".
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Cesiones y Transferencias Internacionales</h2>
              <p className="text-slate-700">
                <strong>Terceros subcontratistas:</strong>
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>OpenAI (GPT-4o):</strong> Procesamiento de IA para corrección (USA - Privacy Shield)</li>
                <li><strong>Supabase:</strong> Almacenamiento de base de datos (UE - servidores en Alemania)</li>
              </ul>
              <p className="text-slate-700 mt-3">
                Todos los subcontratistas cumplen con el RGPD y tienen contratos de Encargado de Tratamiento firmados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Medidas de Seguridad (Art. 32 RGPD)</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Cifrado SSL/TLS en todas las comunicaciones</li>
                <li>Contraseñas cifradas con bcrypt</li>
                <li>Autenticación de dos factores (2FA) opcional</li>
                <li>Registro de auditoría inmutable</li>
                <li>Control de acceso basado en roles (RBAC)</li>
                <li>Copia de seguridad diaria cifrada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Reclamaciones ante la AEPD</h2>
              <p className="text-slate-700">
                Si considera que sus derechos no han sido atendidos, puede presentar una reclamación ante la Agencia Española de Protección de Datos:
              </p>
              <ul className="list-none pl-0 text-slate-700 space-y-1">
                <li><strong>Web:</strong> <a href="https://www.aepd.es" className="text-blue-600 underline" target="_blank" rel="noopener">www.aepd.es</a></li>
                <li><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</li>
              </ul>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Nota importante:</strong> Esta política de privacidad cumple con el RGPD y la LOPDGDD. Para cualquier duda, contacte con nuestro DPO en <a href="mailto:dpo@colegio.es" className="underline">dpo@colegio.es</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
