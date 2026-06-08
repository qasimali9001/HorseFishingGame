/** Per-lure screen layout: origin is the line/hook anchor; bait sits on the hook. */
export interface LureVisualLayout {
  originX: number
  originY: number
  baitOffsetX: number
  baitOffsetY: number
}

/** Bobber + hook rig (no sinker). Origin = top line eyelet. */
const basicBobberHookLayout: LureVisualLayout = {
  originX: 0.5,
  originY: 0.12,
  /** Left/down to the barbed hook point on lure_basic.png. */
  baitOffsetX: -7,
  baitOffsetY: 29,
}

/** Same bobber/hook head; extra weight hangs below the curve on longer art. */
const weight10kgBobberHookLayout: LureVisualLayout = {
  originX: 0.5,
  originY: 0.12,
  /** Left/down to the barbed hook point on lure_10kg_weight.png. */
  baitOffsetX: -12,
  baitOffsetY: 23,
}

export const LureVisualConfig = {
  defaultLayout: basicBobberHookLayout,
  byVisualId: {
    'lure-basic': basicBobberHookLayout,
    'lure-10kg-weight': weight10kgBobberHookLayout,
  } as Record<string, LureVisualLayout>,
}

export function getLureVisualLayout(visualId: string): LureVisualLayout {
  return LureVisualConfig.byVisualId[visualId] ?? LureVisualConfig.defaultLayout
}
