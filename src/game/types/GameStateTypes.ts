/** The fishing loop's single source of truth for "what is happening now". */
export enum FishingState {
  IdleAtSurface = 'IdleAtSurface',
  Charging = 'Charging',
  Casting = 'Casting',
  Sinking = 'Sinking',
  WaitingForBite = 'WaitingForBite',
  FishHooked = 'FishHooked',
  Reeling = 'Reeling',
  CatchLanded = 'CatchLanded',
  AwaitingCatchDecision = 'AwaitingCatchDecision',
  CatchLost = 'CatchLost',
}
