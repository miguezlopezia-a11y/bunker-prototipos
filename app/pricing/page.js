import React from 'react'
import Link from 'next/link'
import { Check, ArrowLeft, Zap, Users, Building2 } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Básico',
      price: '29',
      icon: Zap,
      description: 'Ideal para profesores individuales',
      features: [
        '1 profesor',
        '100 exámenes/mes',
        'Corrección con GPT-4o',
        'Historial 12 meses',
        'Soporte por email',
        'Exportación PDF',
        'Estadísticas básicas'
      ],
      cta: 'Empezar gratis 7 días',
      color: 'blue'
    },
    {
      name: 'Profesional',
      price: '79',
      icon: Users,
      description: 'Para departamentos pequeños',
      features: [
        '5 profesores',
        '500 exámenes/mes',
        'Corrección con GPT-4o',
        'Historial ilimitado',
        'Soporte prioritario',
        'Exportación CSV + PDF',
        'Estadísticas avanzadas',
        'Biblioteca de rúbricas compartida',
        'Alertas de rendimiento'
      ],
      cta: 'Empezar gratis 14 días',
      color: 'green',
      popular: true
    },
    {
      name: 'Centro',
      price: '199',
      icon: Building2,
      description: 'Solución completa para centros educativos',
      features: [
        'Profesores ilimitados',
        'Exámenes ilimitados',
        'Corrección con GPT-4o + Kimi K2.6',
        'Historial ilimitado',
        'Soporte dedicado 24/7',
        'Exportación CSV + PDF + JSON',
        'Dashboard ejecutivo',
        'Integración con SIS',
        'Múltiples centros',
        'RoPA automatizado',
        'Onboarding personalizado',
        'Cumplimiento RGPD total'
      ],
      cta: 'Solicitar demo',
      color: 'purple'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Elige el plan perfecto para tu centro educativo. Sin compromiso, cancela cuando quieras.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                  plan.popular ? 'border-green-500 scale-105' : 'border-slate-200'
                } p-8 hover:shadow-xl transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Más popular
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 bg-${plan.color}-100 rounded-xl mb-4`}>
                  <Icon className={`w-8 h-8 text-${plan.color}-600`} />
                </div>

                {/* Plan name */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}€</span>
                    <span className="text-slate-600">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">IVA incluido. Facturación mensual.</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ / Additional info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-slate-700">Sí, puedes actualizar o degradar tu plan cuando quieras. El cambio se aplica en el siguiente ciclo de facturación.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Qué pasa si supero el límite de exámenes?</h3>
              <p className="text-slate-700">Recibirás una notificación al llegar al 80% del límite. Si lo superas, se te sugerirá actualizar a un plan superior o esperar al siguiente mes.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Los datos están protegidos según RGPD?</h3>
              <p className="text-slate-700">Absolutamente. Cumplimos 100% con RGPD y LOPDGDD. Lee nuestra <Link href="/legal/privacy" className="text-blue-600 underline">Política de Privacidad</Link>.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Qué incluye la prueba gratuita?</h3>
              <p className="text-slate-700">Acceso completo a todas las funciones del plan elegido, sin necesidad de tarjeta de crédito. Cancela antes del fin del periodo sin coste.</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">¿Necesitas un plan personalizado para tu centro?</p>
          <a
            href="mailto:ventas@corrector-ia.es"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Contáctanos
          </a>
        </div>
      </div>
    </div>
  )
}
