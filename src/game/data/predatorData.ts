import type { PredatorDefinition } from '../types/PredatorTypes'

/**
 * Starter predators. They patrol calmly until the player has a hooked fish in
 * range, then chase it; reaching it risks stealing the catch. Deliberately few
 * and simple -- they exist for tension, not a combat system.
 */
export const PREDATOR_DATA: readonly PredatorDefinition[] = [
  {
    id: 'snapjaw',
    displayName: 'Snapjaw',
    color: 0xe76f51,
    biomeIds: ['kelp-forest', 'twilight-waters'],
    minDepth: 520,
    maxDepth: 1700,
    radius: 30,
    patrolSpeedMin: 40,
    patrolSpeedMax: 70,
    detectionRadius: 320,
    chaseSpeed: 165,
    attackRadius: 46,
    eatChance: 0.4,
  },
  {
    id: 'gloom-eel',
    displayName: 'Gloom Eel',
    color: 0x9b5de5,
    biomeIds: ['midnight-trench', 'industrial-graveyard', 'the-maw'],
    minDepth: 1800,
    maxDepth: 4000,
    radius: 34,
    patrolSpeedMin: 30,
    patrolSpeedMax: 60,
    detectionRadius: 420,
    chaseSpeed: 200,
    attackRadius: 54,
    eatChance: 0.55,
  },
] as const
