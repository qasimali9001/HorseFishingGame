import { FishTextures } from '../assets/FishArtCatalog'
import type { FishDefinition } from '../types/FishTypes'
import type { SpawnPointDefinition } from '../types/SpawnPointTypes'

const ART_ID_EXPORT_REF = new Map<string, string>(
  Object.entries(FishTextures).map(([name, artId]) => [artId, `FishTextures.${name}`]),
)

/** Paste-ready spawn-point array for `data/spawnPointData.ts`. */
export function formatSpawnPointExport(points: readonly SpawnPointDefinition[]): string {
  const body = points
    .map((p) => {
      const enabled = p.enabled === false ? ', enabled: false' : ''
      return `  { id: '${p.id}', x: ${p.x}, y: ${p.y}, fishId: '${p.fishId}', maxAlive: ${p.maxAlive}, swimRange: ${p.swimRange}${enabled} },`
    })
    .join('\n')

  return (
    "import type { SpawnPointDefinition } from '../types/SpawnPointTypes'\n\n" +
    'export const SPAWN_POINT_DATA: readonly SpawnPointDefinition[] = [\n' +
    body +
    '\n]\n'
  )
}

/** Paste-ready fish catalog for `data/fishData.ts`. */
export function formatFishDataExport(fish: readonly FishDefinition[]): string {
  const body = fish
    .map((f) => {
      const biomeIds = f.biomeIds.map((id) => `'${id}'`).join(', ')
      return [
        '  {',
        `    id: '${f.id}',`,
        `    displayName: '${f.displayName}',`,
        `    artId: ${ART_ID_EXPORT_REF.get(f.artId) ?? `'${f.artId}'`},`,
        `    sizeTier: '${f.sizeTier}',`,
        `    requiredBaitTier: '${f.requiredBaitTier}',`,
        `    color: 0x${f.color.toString(16).padStart(6, '0')},`,
        `    biomeIds: [${biomeIds}],`,
        `    rarity: '${f.rarity}',`,
        `    value: ${f.value},`,
        `    speed: ${f.speed},`,
        `    aggressionRadius: ${f.aggressionRadius},`,
        `    respawnMs: ${f.respawnMs},`,
        `    radius: ${f.radius},`,
        `    canBeHooked: ${f.canBeHooked},`,
        '  },',
      ].join('\n')
    })
    .join('\n')

  return (
    "import type { FishDefinition } from '../types/FishTypes'\n" +
    "import { FishTextures } from '../assets/FishArtCatalog'\n\n" +
    'export const FISH_DATA: readonly FishDefinition[] = [\n' +
    body +
    '\n] as const\n'
  )
}

/** Combined export block logged/copied from the level editor. */
export function formatLevelEditorExport(
  points: readonly SpawnPointDefinition[],
  fish: readonly FishDefinition[],
): string {
  return (
    '// --- Paste into src/game/data/spawnPointData.ts ---\n\n' +
    formatSpawnPointExport(points) +
    '\n\n// --- Paste into src/game/data/fishData.ts ---\n\n' +
    formatFishDataExport(fish)
  )
}
