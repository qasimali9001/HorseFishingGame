/** Screen-space layout for the settings window and volume sliders. */
export const SettingsUIConfig = {
  iconButton: {
    topOffset: 150,
  },
  window: {
    width: 420,
    height: 280,
    backdropColor: 0x000000,
    backdropAlpha: 0.5,
    panelColor: 0x0c1c28,
    panelBorderColor: 0x7dd8ff,
    panelBorderWidth: 2,
    panelAlpha: 0.96,
    titleColor: '#e4f6ff',
    subtitleColor: '#a8cfe0',
  },
  slider: {
    trackWidth: 280,
    trackHeight: 10,
    handleSize: 18,
    labelColor: '#eaf7ff',
    valueColor: '#c4e3ef',
    trackColor: 0x12384b,
    trackBorderColor: 0x7cc6e4,
    fillColor: 0x3a9cc4,
    handleColor: 0xebf8ff,
    handleBorderColor: 0x7dd8ff,
    firstRowYOffset: 108,
    rowGap: 64,
  },
} as const
