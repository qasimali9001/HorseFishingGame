/** Picks the shop-row texture, falling back to gameplay art when no icon is set. */
export function resolveShopIconTextureKey(item: {
  textureKey: string
  shopIconKey?: string
}): string {
  return item.shopIconKey ?? item.textureKey
}
