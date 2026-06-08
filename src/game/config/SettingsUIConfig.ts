/** Screen-space layout for the settings window and volume sliders. */
export const SettingsUIConfig = {
  window: {
    width: 460,
    height: 300,
    backdropColor: 0x000000,
    backdropAlpha: 0.5,
    titleColor: '#fff0ce',
    subtitleColor: '#2d1a0b',
  },
  slider: {
    trackWidth: 310,
    trackHeight: 14,
    handleSize: 22,
    labelColor: '#2a160a',
    valueColor: '#287c2b',
    trackColor: 0xe7b970,
    trackBorderColor: 0x2a160a,
    fillColor: 0x5b8f34,
    handleColor: 0xf0d394,
    handleBorderColor: 0x2a160a,
    firstRowYOffset: 128,
    rowGap: 72,
  },
} as const
