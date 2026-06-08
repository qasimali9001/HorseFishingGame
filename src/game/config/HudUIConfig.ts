import { ShopUIConfig } from './ShopUIConfig'

/** Shared screen-space anchors for the always-visible HUD chrome. */
export const HudUIConfig = {
  topPadding: 6,
  edgePadding: 12,
  columnGap: 6,
  moneyHeight: 42,
  moneyMinWidth: 112,
  iconGap: 10,
  iconSize: ShopUIConfig.iconButton.size,
  rowHeight: ShopUIConfig.iconButton.size,
} as const
