/** The fishing loop's single source of truth for "what is happening now". */
export enum FishingState {
  IdleAtSurface = 'IdleAtSurface',
  Charging = 'Charging',
  Casting = 'Casting',
  CastFailed = 'CastFailed',
  Sinking = 'Sinking',
  WaitingForBite = 'WaitingForBite',
  FishHooked = 'FishHooked',
  Reeling = 'Reeling',
  CatchLanded = 'CatchLanded',
  CatchLost = 'CatchLost',
}
