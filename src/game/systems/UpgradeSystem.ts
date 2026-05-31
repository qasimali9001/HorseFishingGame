import type { ShopEffectId, ShopUpgradeDefinition } from '../types/ShopTypes'

/**
 * Pure upgrade progression state: levels, prices, and contribution totals.
 * This module intentionally knows nothing about money or UI.
 */
export class UpgradeSystem {
  private readonly definitionsById = new Map<string, ShopUpgradeDefinition>()
  private readonly levels = new Map<string, number>()

  constructor(definitions: readonly ShopUpgradeDefinition[]) {
    for (const definition of definitions) {
      this.definitionsById.set(definition.id, definition)
      this.levels.set(definition.id, 0)
    }
  }

  getDefinition(id: string): ShopUpgradeDefinition | undefined {
    return this.definitionsById.get(id)
  }

  getLevel(id: string): number {
    return this.levels.get(id) ?? 0
  }

  getNextCost(id: string): number {
    const definition = this.definitionsById.get(id)
    if (!definition) {
      return Number.POSITIVE_INFINITY
    }
    const level = this.getLevel(id)
    if (level >= definition.maxLevel) {
      return Number.POSITIVE_INFINITY
    }
    return Math.round(definition.baseCost * Math.pow(definition.costMultiplier, level))
  }

  isMaxed(id: string): boolean {
    const definition = this.definitionsById.get(id)
    if (!definition) {
      return true
    }
    return this.getLevel(id) >= definition.maxLevel
  }

  tryLevelUp(id: string): boolean {
    const definition = this.definitionsById.get(id)
    if (!definition) {
      return false
    }
    const current = this.getLevel(id)
    if (current >= definition.maxLevel) {
      return false
    }
    this.levels.set(id, current + 1)
    return true
  }

  getContribution(effectId: ShopEffectId): number {
    let total = 0
    for (const definition of this.definitionsById.values()) {
      if (definition.effectId !== effectId) {
        continue
      }
      total += this.getLevel(definition.id) * definition.effectPerLevel
    }
    return total
  }
}

