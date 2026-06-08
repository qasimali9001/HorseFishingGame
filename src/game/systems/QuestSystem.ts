import { QUEST_CHAIN } from '../data/questData'
import { EventBus } from '../events/EventBus'
import { GameEvents } from '../events/GameEvents'
import type { QuestDefinition, QuestStateSnapshot } from '../types/QuestTypes'
import type { ShopCatalogId } from '../types/ShopCatalogTypes'
import type { EconomySystem } from './EconomySystem'
import type { CatalogSaveState } from './GameSaveSystem'

export interface QuestSaveState {
  activeIndex: number
  progress: number
}

export interface QuestSavePort {
  getQuestState(): QuestSaveState | undefined
  setQuestState(state: QuestSaveState): void
  getCatalogState(catalogId: ShopCatalogId): CatalogSaveState | undefined
}

/**
 * Tracks one active quest at a time from the linear quest chain. Progresses on
 * landed catches and successful shop purchases, then grants bonus gold rewards.
 */
export class QuestSystem {
  private activeIndex: number
  private progress: number

  constructor(
    private readonly economy: EconomySystem,
    private readonly save?: QuestSavePort,
  ) {
    const saved = save?.getQuestState()
    this.activeIndex = saved?.activeIndex ?? 0
    this.progress = saved?.progress ?? 0

    EventBus.on(GameEvents.CATCH_LANDED, this.onCatchLanded)
    EventBus.on(GameEvents.SHOP_ITEM_PURCHASED, this.onItemPurchased)
    EventBus.on(GameEvents.QUEST_STATE_REQUESTED, this.onStateRequested)

    this.resolveAlreadyOwnedPurchaseQuest()
    this.emitState()
  }

  destroy(): void {
    EventBus.off(GameEvents.CATCH_LANDED, this.onCatchLanded)
    EventBus.off(GameEvents.SHOP_ITEM_PURCHASED, this.onItemPurchased)
    EventBus.off(GameEvents.QUEST_STATE_REQUESTED, this.onStateRequested)
  }

  private get activeQuest(): QuestDefinition | null {
    if (this.activeIndex >= QUEST_CHAIN.length) {
      return null
    }
    return QUEST_CHAIN[this.activeIndex]
  }

  private buildSnapshot(): QuestStateSnapshot {
    const quest = this.activeQuest
    if (!quest) {
      return { quest: null, progress: 0, target: 0, complete: true }
    }

    const target = quest.goal.kind === 'catch-fish' ? quest.goal.count : 1
    return {
      quest,
      progress: Math.min(this.progress, target),
      target,
      complete: false,
    }
  }

  private emitState(): void {
    EventBus.emit(GameEvents.QUEST_STATE_CHANGED, this.buildSnapshot())
  }

  private persist(): void {
    this.save?.setQuestState({
      activeIndex: this.activeIndex,
      progress: this.progress,
    })
  }

  private resolveAlreadyOwnedPurchaseQuest(): void {
    const quest = this.activeQuest
    if (!quest || quest.goal.kind !== 'buy-item') {
      return
    }

    const owned = this.save
      ?.getCatalogState(quest.goal.catalogId)
      ?.ownedIds.includes(quest.goal.itemId)
    if (owned) {
      this.completeActiveQuest()
    }
  }

  private completeActiveQuest(): void {
    const quest = this.activeQuest
    if (!quest) {
      return
    }

    this.economy.sell(quest.goldReward)
    EventBus.emit(GameEvents.QUEST_COMPLETED, {
      questId: quest.id,
      title: quest.title,
      goldReward: quest.goldReward,
    })

    this.activeIndex += 1
    this.progress = 0
    this.persist()
    this.resolveAlreadyOwnedPurchaseQuest()
    this.emitState()
  }

  private readonly onCatchLanded = (payload: { fishId: string }): void => {
    const quest = this.activeQuest
    if (!quest || quest.goal.kind !== 'catch-fish' || payload.fishId !== quest.goal.fishId) {
      return
    }

    this.progress += 1
    this.persist()

    if (this.progress >= quest.goal.count) {
      this.completeActiveQuest()
      return
    }

    this.emitState()
  }

  private readonly onItemPurchased = (payload: {
    catalogId: ShopCatalogId
    itemId: string
  }): void => {
    const quest = this.activeQuest
    if (
      !quest ||
      quest.goal.kind !== 'buy-item' ||
      payload.catalogId !== quest.goal.catalogId ||
      payload.itemId !== quest.goal.itemId
    ) {
      return
    }

    this.completeActiveQuest()
  }

  private readonly onStateRequested = (): void => {
    this.emitState()
  }
}
