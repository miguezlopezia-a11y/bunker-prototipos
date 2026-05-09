'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowLeft, Zap, Building2, GraduationCap } from 'lucide-react'
import { PRICING_TIERS, OVERAGE_PRICE_PER_PAGE, calculateMonthlyCost } from '@/lib/pricing'

export default function PricingPage() {
  const [overageInput, setOverageInput] = useState('')
  const [calculatorTier, setCalculatorTier] = useState('profesional')

  const plans = [
    {
      ...PRICING_TIERS.basico,
      icon: Zap,
      color: 'blue',
      features: [
        '500 páginas / mes incluidas',
        '1-3 profesores',
        'Corrección con GPT-4o Vision',
        'Asistente de configuración (Oposiciones / Academia)',
        'Importación PDF multi-página',
        'Métricas de precisión OCR (CER)',
        'Historial 12 meses',
        'Exportación PDF + CSV',
        'Soporte por email',
        'Sobre cuota: 0,08 € / página adicional'
      ],
      cta: 'Empezar gratis 14 días'
    },
    {
      ...PRICING_TIERS.profesional,
      icon: Building2,
      color: 'green',
      features: [
        '5.000 páginas / mes incluidas',
        'Hasta 25 profesores',
        'Todo lo del plan Básico',
        'Biblioteca de rúbricas compartida',
        'Auditoría de correcciones (ANECA)',
        'Trazabilidad por profesor',
        'Estadísticas avanzadas',
        'Exportación JSON',
        'Soporte prioritario (24h)',
        'Sobre cuota: 0,08 € / página adicional'
      ],
      cta: 'Empezar gratis 14 días'
    },
    {
      ...PRICING_TIERS.institucional,
      icon: GraduationCap,
      color: 'purple',
      features: [
        '50.000 páginas / mes incluidas',
        'Profesores ilimitados',
        'Todo lo del plan Profesional',
        'Múltiples centros / facultades',
        'SSO / Integración SIS',
        'RoPA automatizado + DPIA',
        'Onboarding personalizado',
        'SLA 99,9 % + soporte 24/7',
        'Cumplimiento ANECA y ENS',
        'Sobre cuota: 0,08 € / página adicional'
      ],
      cta: 'Solicitar demo'
    }
  ]

  const overagePages = parseInt(overageInput, 10) || 0
  const calc = calculateMonthlyCost(calculatorTier, overagePages)

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
            Modelo híbrido: cuota mensual fija + sobreuso por páginas. Sin sorpresas, sin compromiso.
          </p>
          <p className="text-sm text-slate-500 mt-3">
            <strong>Páginas adicionales:</strong> {OVERAGE_PRICE_PER_PAGE.toFixed(2).replace('.', ',')} € por página sobre la cuota mensual.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                  plan.popular ? 'border-green-500 md:scale-105' : 'border-slate-200'
                } p-8 hover:shadow-xl transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Más popular
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  plan.color === 'blue' ? 'bg-blue-100' :
                  plan.color === 'green' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    plan.color === 'blue' ? 'text-blue-600' :
                    plan.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                </div>

                {/* Plan name */}
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">{plan.target}</p>
                <p className="text-slate-600 mb-6 text-sm">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}€</span>
                    <span className="text-slate-600">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    <strong>{plan.quota.toLocaleString('es-ES')}</strong> páginas incluidas
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.color === 'blue' ? 'text-blue-600' :
                        plan.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                      <span className="text-slate-700 text-sm">{feature}</span>
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

        {/* Overage Calculator */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-12 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Calculadora de sobreuso</h2>
            <p className="text-slate-600 text-sm">
              Estima tu factura mensual si superas la cuota incluida.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
              <select
                value={calculatorTier}
                onChange={(e) => setCalculatorTier(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(PRICING_TIERS).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} – {t.price}€/mes ({t.quota.toLocaleString('es-ES')} páginas)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Páginas estimadas este mes
              </label>
              <input
                type="number"
                min="0"
                value={overageInput}
                onChange={(e) => setOverageInput(e.target.value)}
                placeholder={`Ej: ${PRICING_TIERS[calculatorTier].quota + 200}`}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cuota mensual ({PRICING_TIERS[calculatorTier].name})</span>
              <span className="font-semibold text-slate-900">{calc.base.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Páginas adicionales ({calc.overagePages.toLocaleString('es-ES')} × 0,08 €)
              </span>
              <span className={`font-semibold ${calc.overagePages > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                {calc.overage.toFixed(2).replace('.', ',')} €
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total estimado</span>
              <span className="text-2xl font-bold text-blue-600">
                {calc.total.toFixed(2).replace('.', ',')} €
              </span>
            </div>
            {calc.overagePages > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">
                ⚠️ Si superas tu cuota habitualmente, considera subir al siguiente plan: el coste por página es siempre menor.
              </p>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Qué cuenta como una "página"?</h3>
              <p className="text-slate-700 text-sm">Cada examen escaneado o cada página de un PDF importado equivale a una página. Las correcciones manuales no consumen cuota.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Cuándo se cobra el sobreuso?</h3>
              <p className="text-slate-700 text-sm">Al cierre del periodo mensual. Recibirás alertas al 80 % y al 95 % de tu cuota para evitar sorpresas.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Puedo cambiar de plan?</h3>
              <p className="text-slate-700 text-sm">Sí, sube o baja en cualquier momento. El cambio se aplica de forma proporcional.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">¿Los datos están protegidos según RGPD?</h3>
              <p className="text-slate-700 text-sm">Cumplimos 100 % con RGPD, LOPDGDD y los requisitos de auditoría académica (ANECA). <Link href="/legal/privacy" className="text-blue-600 underline">Política de Privacidad</Link>.</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">¿Necesitas un plan personalizado o más de 50.000 páginas/mes?</p>
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
