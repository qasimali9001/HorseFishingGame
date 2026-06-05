/** Central registry of cross-module event names. */
export const GameEvents = {
  /** Fishing state machine changed state. payload: { state } */
  STATE_CHANGED: 'state-changed',
  /** A fish made contact with the hook. payload: { fishId } */
  FISH_HOOKED: 'fish-hooked',
  /** A hooked fish reached the surface and was landed. payload: { fishId, value } */
  CATCH_LANDED: 'catch-landed',
  /** Landed fish is waiting for sell/chuck decision. payload: { fishId, displayName, value, canChuck } */
  CATCH_DECISION_REQUIRED: 'catch-decision-required',
  /** Landed fish sold by player or auto-sell path. payload: { fishId, displayName, value, reason } */
  CATCH_SOLD: 'catch-sold',
  /** UI-requested explicit sell action. */
  CATCH_SELL_REQUESTED: 'catch-sell-requested',
  /** Landed fish chucked into bait progression. payload: { fishId, displayName, previousBaitTier, nextBaitTier } */
  CATCH_CHUCKED: 'catch-chucked',
  /** Pending catch decision resolved; hide decision UI. */
  CATCH_DECISION_CLEARED: 'catch-decision-cleared',
  /** A larger fish stole the hooked fish before landing. payload: { fishId, displayName } */
  CATCH_LOST: 'catch-lost',
  /** UI requests current bait state. */
  BAIT_STATE_REQUESTED: 'bait-state-requested',
  /** Current bait tier changed. payload: { baitTier, color, label } */
  BAIT_CHANGED: 'bait-changed',
  /** The lure entered a new depth biome. payload: { biomeId, displayName } */
  BIOME_CHANGED: 'biome-changed',
  /** UI requests current money state. */
  MONEY_STATE_REQUESTED: 'money-state-requested',
  /** Player money changed. payload: { money } */
  MONEY_CHANGED: 'money-changed',
  /** UI requests current shop state snapshot. */
  SHOP_STATE_REQUESTED: 'shop-state-requested',
  /** Shop state changed. payload: ShopStateSnapshot */
  SHOP_STATE_CHANGED: 'shop-state-changed',
  /** UI requests buying one upgrade. payload: { upgradeId } */
  SHOP_PURCHASE_REQUESTED: 'shop-purchase-requested',
  /** Shop feedback toast/notices. payload: { message, tone } */
  SHOP_PURCHASE_FEEDBACK: 'shop-purchase-feedback',
  /** UI requests buying a rod. payload: { rodId } */
  SHOP_ROD_PURCHASE_REQUESTED: 'shop-rod-purchase-requested',
  /** UI requests equipping an owned rod. payload: { rodId } */
  SHOP_ROD_EQUIP_REQUESTED: 'shop-rod-equip-requested',
  /** UI requests buying a catalog item. payload: { catalogId, itemId } */
  SHOP_ITEM_PURCHASE_REQUESTED: 'shop-item-purchase-requested',
  /** UI requests equipping a catalog item. payload: { catalogId, itemId } */
  SHOP_ITEM_EQUIP_REQUESTED: 'shop-item-equip-requested',
  /** A shop catalog changed. payload: { catalogId } */
  SHOP_CATALOG_CHANGED: 'shop-catalog-changed',
  /** Rod shop rows changed. payload: { rods: ShopRodState[] } */
  SHOP_RODS_CHANGED: 'shop-rods-changed',
  /** Equipped rod changed on the horse. payload: { rod: RodDefinition } */
  ROD_EQUIPPED: 'rod-equipped',
  /** Equipped lure changed on the hook. payload: { lure: LureDefinition } */
  LURE_EQUIPPED: 'lure-equipped',
  /** Camera mode changed (debug/diagnostics). payload: { mode } */
  CAMERA_MODE_CHANGED: 'camera-mode-changed',
  /** Per-frame debug snapshot for the overlay. payload: { depth, cameraMode } */
  DEBUG_TICK: 'debug-tick',
} as const

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents]
