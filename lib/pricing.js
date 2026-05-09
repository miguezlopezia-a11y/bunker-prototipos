// Hybrid pricing tiers (Session 5)
export const PRICING_TIERS = {
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 49,
    quota: 500,
    target: 'Academias pequeñas',
    description: 'Ideal para academias y profesores particulares'
  },
  profesional: {
    id: 'profesional',
    name: 'Profesional',
    price: 199,
    quota: 5000,
    target: 'Centros medianos',
    description: 'Para centros educativos con varios departamentos',
    popular: true
  },
  institucional: {
    id: 'institucional',
    name: 'Institucional',
    price: 799,
    quota: 50000,
    target: 'Universidades',
    description: 'Solución completa para universidades y grupos educativos'
  }
}

export const OVERAGE_PRICE_PER_PAGE = 0.08 // EUR

export function calculateMonthlyCost(tier, pagesUsed) {
  const plan = PRICING_TIERS[tier]
  if (!plan) return 0
  const overage = Math.max(0, pagesUsed - plan.quota)
  return {
    base: plan.price,
    overage: parseFloat((overage * OVERAGE_PRICE_PER_PAGE).toFixed(2)),
    total: parseFloat((plan.price + overage * OVERAGE_PRICE_PER_PAGE).toFixed(2)),
    overagePages: overage
  }
}

export function getQuotaForTier(tierId) {
  return PRICING_TIERS[tierId]?.quota || PRICING_TIERS.basico.quota
}
