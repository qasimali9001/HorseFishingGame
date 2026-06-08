/** Passive income investment available in the shop. */
export interface InvestmentDefinition {
  id: string
  displayName: string
  description: string
  textureKey: string
  shopIconKey?: string
  cost: number
  /** Dollars granted each payout tick while owned. */
  incomePerTick: number
}
