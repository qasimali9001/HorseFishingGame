import { GameSaveConfig } from '../config/GameSaveConfig'
import type { ShopCatalogId } from '../types/ShopCatalogTypes'

export interface CatalogSaveState {
  readonly ownedIds: readonly string[]
  readonly equippedId: string
}

interface GameSaveData {
  readonly version: number
  readonly money: number
  readonly catalogs: Partial<Record<ShopCatalogId, CatalogSaveState>>
}

const CatalogIds = ['rods', 'boats', 'lures', 'investments'] as const satisfies readonly ShopCatalogId[]

function createDefaultSave(): GameSaveData {
  return {
    version: GameSaveConfig.version,
    money: 0,
    catalogs: {},
  }
}

function resolveLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const testKey = `${GameSaveConfig.storageKey}:test`
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseMoney(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

function parseCatalogState(value: unknown): CatalogSaveState | null {
  if (!isRecord(value) || !Array.isArray(value.ownedIds) || typeof value.equippedId !== 'string') {
    return null
  }

  return {
    ownedIds: value.ownedIds.filter((id): id is string => typeof id === 'string'),
    equippedId: value.equippedId,
  }
}

/**
 * Browser-local persistence boundary. Gameplay systems own their state; this
 * class only serializes validated snapshots to localStorage.
 */
export class GameSaveSystem {
  private data: GameSaveData

  constructor(private readonly storage: Storage | null = resolveLocalStorage()) {
    this.data = this.load()
  }

  get money(): number {
    return this.data.money
  }

  getCatalogState(catalogId: ShopCatalogId): CatalogSaveState | undefined {
    const state = this.data.catalogs[catalogId]
    if (!state) {
      return undefined
    }

    return {
      ownedIds: [...state.ownedIds],
      equippedId: state.equippedId,
    }
  }

  setMoney(money: number): void {
    this.data = {
      ...this.data,
      money: parseMoney(money),
    }
    this.write()
  }

  setCatalogState(catalogId: ShopCatalogId, state: CatalogSaveState): void {
    this.data = {
      ...this.data,
      catalogs: {
        ...this.data.catalogs,
        [catalogId]: {
          ownedIds: [...new Set(state.ownedIds)],
          equippedId: state.equippedId,
        },
      },
    }
    this.write()
  }

  private load(): GameSaveData {
    if (!this.storage) {
      return createDefaultSave()
    }

    try {
      const raw = this.storage.getItem(GameSaveConfig.storageKey)
      if (!raw) {
        return createDefaultSave()
      }

      const parsed: unknown = JSON.parse(raw)
      if (!isRecord(parsed)) {
        return createDefaultSave()
      }

      const catalogs: Partial<Record<ShopCatalogId, CatalogSaveState>> = {}
      const parsedCatalogs = isRecord(parsed.catalogs) ? parsed.catalogs : {}
      for (const catalogId of CatalogIds) {
        const catalogState = parseCatalogState(parsedCatalogs[catalogId])
        if (catalogState) {
          catalogs[catalogId] = catalogState
        }
      }

      return {
        version: GameSaveConfig.version,
        money: parseMoney(parsed.money),
        catalogs,
      }
    } catch {
      return createDefaultSave()
    }
  }

  private write(): void {
    if (!this.storage) {
      return
    }

    try {
      this.storage.setItem(GameSaveConfig.storageKey, JSON.stringify(this.data))
    } catch {
      // Ignore quota/private-mode failures; the in-memory session can continue.
    }
  }
}
