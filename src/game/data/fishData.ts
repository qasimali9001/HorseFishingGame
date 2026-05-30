import type { FishDefinition } from '../types/FishTypes'

/**
 * Starter species, spread across the reachable depth column so the player meets
 * different fish as they go deeper. Deliberately small -- prove the system,
 * then expand. Values rise with depth to reward "buy more line".
 */
export const FISH_DATA: readonly FishDefinition[] = [
  {
    id: 'pebble-minnow',
    displayName: 'Pebble Minnow',
    color: 0x9ad1e6,
    minDepth: 40,
    maxDepth: 420,
    value: 5,
    speedMin: 45,
    speedMax: 80,
    radius: 12,
    behavior: 'skittish',
    canBeHooked: true,
  },
  {
    id: 'sun-perch',
    displayName: 'Sun Perch',
    color: 0xf4a259,
    minDepth: 300,
    maxDepth: 780,
    value: 12,
    speedMin: 35,
    speedMax: 65,
    radius: 16,
    behavior: 'casual',
    canBeHooked: true,
  },
  {
    id: 'deep-gulper',
    displayName: 'Deep Gulper',
    color: 0x8a7bd8,
    minDepth: 650,
    maxDepth: 1100,
    value: 30,
    speedMin: 25,
    speedMax: 50,
    radius: 22,
    behavior: 'curious',
    canBeHooked: true,
  },
] as const
