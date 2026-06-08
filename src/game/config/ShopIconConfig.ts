import { ShopUIConfig } from './ShopUIConfig'

/**
 * Shop catalog icon art spec. Icons render inside a square host and are
 * uniformly scaled to fit without cropping.
 */
export const ShopIconConfig = {
  /** Recommended square PNG size when authoring dedicated shop icons. */
  recommendedSourceSize: 64,
  /** Transparent padding to leave inside the source canvas so row borders do not clip art. */
  recommendedPaddingPx: 8,
  /** On-screen icon host (dark square behind the image). */
  hostSize: ShopUIConfig.catalogList.iconSize,
  /** Inset between host edge and the fitted image on each side. */
  fitPadding: 4,
  /** Longest side of the fitted image in screen pixels. */
  fitMaxSize: ShopUIConfig.catalogList.iconSize - 4,
} as const
