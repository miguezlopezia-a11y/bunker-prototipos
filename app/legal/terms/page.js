import React from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Términos y Condiciones de Servicio</h1>
          </div>

          <p className="text-sm text-slate-600 mb-8">Última actualización: 15 de junio de 2025</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Aceptación de los Términos</h2>
              <p className="text-slate-700">
                Al acceder y utilizar la plataforma de Corrector de Exámenes con IA (en adelante, "el Servicio"), usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo, no utilice el Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Descripción del Servicio</h2>
              <p className="text-slate-700">
                El Servicio es una aplicación web SaaS destinada a centros educativos españoles para la corrección automatizada de exámenes mediante inteligencia artificial (GPT-4o).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Usuarios Autorizados</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Acceso restringido:</strong> Solo profesores autorizados por el centro educativo</li>
                <li><strong>No autoregistro:</strong> Las cuentas son creadas únicamente por administradores</li>
                <li><strong>Uso profesional:</strong> El Servicio es exclusivo para fines educativos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Obligaciones del Usuario</h2>
              <p className="text-slate-700">El usuario se compromete a:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>No compartir su cuenta con terceros</li>
                <li>Usar el Servicio conforme a la ley y estos Términos</li>
                <li>Obtener consentimiento de padres/tutores para datos de menores de 14 años</li>
                <li>No intentar acceder a datos de otros usuarios</li>
                <li>No realizar ingeniería inversa o ataques al sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Propiedad Intelectual</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Software:</strong> Todos los derechos sobre el código, diseño y marca son del proveedor</li>
                <li><strong>Contenido del usuario:</strong> Los exámenes y datos subidos siguen siendo propiedad del centro educativo</li>
                <li><strong>Resultados de IA:</strong> Las correcciones generadas son propiedad del usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Limitación de Uso</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Límite de exámenes:</strong> 30 correcciones por hora por profesor (anti-abuso)</li>
                <li><strong>Tamaño de archivo:</strong> Máximo 10 MB por imagen de examen</li>
                <li><strong>Formatos admitidos:</strong> JPEG, PNG, WebP</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Disponibilidad del Servicio</h2>
              <p className="text-slate-700">
                <strong>SLA (Service Level Agreement):</strong>
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Disponibilidad:</strong> 99.5% mensual (excluye mantenimiento programado)</li>
                <li><strong>Mantenimiento:</strong> Notificado con 48h de antelación</li>
                <li><strong>Soporte:</strong> L-V 9:00-18:00 (hora de España peninsular)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Precios y Planes</h2>
              <p className="text-slate-700">El Servicio ofrece tres planes:</p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Básico:</strong> 29€/mes - 1 profesor, 100 exámenes/mes</li>
                <li><strong>Profesional:</strong> 79€/mes - 5 profesores, 500 exámenes/mes</li>
                <li><strong>Centro:</strong> 199€/mes - Profesores ilimitados, exámenes ilimitados</li>
              </ul>
              <p className="text-slate-700 mt-3">
                Facturación mensual. Precios IVA incluido. Cancelación sin compromiso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Política de Cancelación</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Cancelación sin penalización en cualquier momento</li>
                <li>Acceso hasta el final del periodo de facturación</li>
                <li>No se emiten reembolsos parciales</li>
                <li>Exportación de datos disponible 30 días post-cancelación</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Limitación de Responsabilidad</h2>
              <p className="text-slate-700">
                <strong>Exención:</strong> El proveedor NO es responsable de:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Errores en las correcciones de IA (son asistencia, no sustituyen al profesor)</li>
                <li>Pérdida de datos causada por el usuario</li>
                <li>Interrupciones del servicio de terceros (OpenAI, Supabase)</li>
                <li>Daños indirectos o lucro cesante</li>
              </ul>
              <p className="text-slate-700 mt-3">
                <strong>Responsabilidad máxima:</strong> Limitada al importe pagado en los últimos 3 meses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Uso de Inteligencia Artificial</h2>
              <p className="text-slate-700">
                <strong>Advertencia:</strong> Las correcciones generadas por IA deben ser revisadas por un profesor. El sistema es una herramienta de asistencia, NO sustituye el juicio pedagógico humano.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibent text-slate-900 mb-3">12. Protección de Datos</h2>
              <p className="text-slate-700">
                El tratamiento de datos personales se rige por nuestra{' '}
                <Link href="/legal/privacy" className="text-blue-600 underline">Política de Privacidad</Link>, en cumplimiento del RGPD y LOPDGDD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Modificaciones de los Términos</h2>
              <p className="text-slate-700">
                Nos reservamos el derecho de modificar estos Términos. Los cambios serán notificados con 30 días de antelación por email. El uso continuado del Servicio después de la notificación constituye aceptación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Ley Aplicable y Jurisdicción</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Ley aplicable:</strong> Legislación española</li>
                <li><strong>Jurisdicción:</strong> Juzgados y Tribunales de [Ciudad del Centro Educativo]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">15. Contacto</h2>
              <p className="text-slate-700">
                Para cualquier consulta sobre estos Términos:
              </p>
              <ul className="list-none pl-0 text-slate-700 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:soporte@colegio.es" className="text-blue-600 underline">soporte@colegio.es</a></li>
                <li><strong>Teléfono:</strong> +34 900 123 456</li>
              </ul>
            </section>

            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Importante:</strong> Al utilizar el Servicio, usted acepta estos Términos y nuestra Política de Privacidad. Si es un centro educativo, asegúrese de obtener los consentimientos necesarios para el tratamiento de datos de estudiantes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
