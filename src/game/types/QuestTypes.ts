import type { ShopCatalogId } from './ShopCatalogTypes'

export type QuestGoal =
  | { kind: 'catch-fish'; fishId: string; count: number }
  | { kind: 'buy-item'; catalogId: ShopCatalogId; itemId: string }

export interface QuestDefinition {
  id: string
  title: string
  description: string
  goal: QuestGoal
  goldReward: number
}

/** Read-only snapshot for the quest HUD. */
export interface QuestStateSnapshot {
  /** Null when every quest in the chain is complete. */
  quest: QuestDefinition | null
  progress: number
  target: number
  complete: boolean
}
