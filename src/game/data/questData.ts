import type { QuestDefinition } from '../types/QuestTypes'

/**
 * Linear quest chain — only one quest is active at a time, in this order.
 * Rewards are bonus gold on top of normal fishing income.
 */
export const QUEST_CHAIN: readonly QuestDefinition[] = [
  {
    id: 'catch-slender-minnows',
    title: 'Minnow Patrol',
    description: 'Catch 3 Slender Minnows.',
    goal: { kind: 'catch-fish', fishId: 'slender-blue-white', count: 3 },
    goldReward: 25,
  },
  {
    id: 'catch-goldfish',
    title: 'Golden Hour',
    description: 'Catch 3 Goldfish.',
    goal: { kind: 'catch-fish', fishId: 'goldfish-orange', count: 3 },
    goldReward: 25,
  },
  {
    id: 'buy-wooden-rod',
    title: 'Better Gear',
    description: 'Buy the Wooden Rod from the shop.',
    goal: { kind: 'buy-item', catalogId: 'rods', itemId: 'rod-wooden' },
    goldReward: 35,
  },
  {
    id: 'buy-heavy-lure',
    title: 'Sink Faster',
    description: 'Buy the 10kg Weight lure.',
    goal: { kind: 'buy-item', catalogId: 'lures', itemId: 'lure-10kg-weight' },
    goldReward: 40,
  },
  {
    id: 'catch-mud-darts',
    title: 'Shore Snacks',
    description: 'Catch 3 Mud Darts.',
    goal: { kind: 'catch-fish', fishId: 'greenish-brown', count: 3 },
    goldReward: 30,
  },
  {
    id: 'catch-blue-tangs',
    title: 'Tang Time',
    description: 'Catch 3 Blue Tangs.',
    goal: { kind: 'catch-fish', fishId: 'blue-tang', count: 3 },
    goldReward: 40,
  },
  {
    id: 'catch-olive-pikes',
    title: 'Pike Pursuit',
    description: 'Catch 2 Olive Pikes.',
    goal: { kind: 'catch-fish', fishId: 'olive-pike', count: 2 },
    goldReward: 50,
  },
  {
    id: 'catch-blue-tunas',
    title: 'Deep Run',
    description: 'Catch 2 Blue Tunas.',
    goal: { kind: 'catch-fish', fishId: 'blue-tuna', count: 2 },
    goldReward: 75,
  },
] as const
