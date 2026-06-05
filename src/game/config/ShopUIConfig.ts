const catalogList = {
  rowWidth: 492,
  rowHeight: 72,
  rowGap: 8,
  listSlots: 4,
  contentTopOffset: 200,
  contentInsetX: 24,
  iconSize: 48,
  iconLeft: 36,
  textLeft: 88,
  textWidth: 268,
  buttonWidth: 96,
  buttonHeight: 32,
  buttonRight: 58,
  buttonBottom: 14,
  listPaddingBottom: 20,
} as const

const catalogListHeight = catalogList.listSlots * catalogList.rowHeight + (catalogList.listSlots - 1) * catalogList.rowGap

const shopTabs = {
  width: 119,
  height: 30,
  gap: 8,
  yOffset: 122,
} as const

export const ShopUIConfig = {
  iconButton: {
    size: 52,
    edgePadding: 18,
    fillColor: 0x0f2a3d,
    fillAlpha: 0.6,
    strokeColor: 0x9fd6e6,
    strokeWidth: 2,
    iconColor: 0xebf8ff,
  },
  tabs: shopTabs,
  window: {
    width: catalogList.rowWidth + catalogList.contentInsetX * 2,
    height: catalogList.contentTopOffset + catalogListHeight + catalogList.listPaddingBottom,
    contentInsetX: catalogList.contentInsetX,
    backdropColor: 0x000000,
    backdropAlpha: 0.5,
    panelColor: 0x0c1c28,
    panelBorderColor: 0x7dd8ff,
    panelBorderWidth: 2,
    panelAlpha: 0.96,
    titleColor: '#e4f6ff',
    subtitleColor: '#a8cfe0',
    cardColor: 0x12384b,
    cardBorderColor: 0x7cc6e4,
    cardTextColor: '#eaf7ff',
    cardSubtextColor: '#c4e3ef',
    cardActiveColor: 0x195070,
    cardLockedColor: 0x0f2430,
    purchaseButtonColor: 0x215d35,
    purchaseButtonBorderColor: 0xb7f4c7,
    purchaseButtonDisabledColor: 0x4b4f55,
    purchaseButtonDisabledBorderColor: 0x878d95,
    placeholderTextColor: '#9ec2d4',
  },
  catalogList: {
    ...catalogList,
    listHeight: catalogListHeight,
  },
} as const
