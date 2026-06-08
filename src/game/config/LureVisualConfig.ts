/** Per-lure screen layout: origin is the line/hook anchor; bait sits on the hook. */
export interface LureVisualLayout {
  originX: number
  originY: number
  baitOffsetX: number
  baitOffsetY: number
}

/** Shared bobber + hook rig used by basic and weighted lure art. */
const bobberHookLayout: LureVisualLayout = {
  originX: 0.5,
  originY: 0.12,
  /** Left/down from shank center so bait sits on the barbed hook point. */
  baitOffsetX: -13,
  baitOffsetY: 36,
}

export const LureVisualConfig = {
  defaultLayout: bobberHookLayout,
  byVisualId: {
    'lure-basic': bobberHookLayout,
    'lure-10kg-weight': bobberHookLayout,
  } as Record<string, LureVisualLayout>,
}

export function getLureVisualLayout(visualId: string): LureVisualLayout {
  return LureVisualConfig.byVisualId[visualId] ?? LureVisualConfig.defaultLayout
}
