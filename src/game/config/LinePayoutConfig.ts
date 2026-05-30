/** Tuning for the line payout / reel-in depth constraint model. */
export const LinePayoutConfig = {
  /**
   * Per-cast line cap from cast power.
   * The cap is a fraction of the rod's max line length (PlayerStats.maxDepth).
   */
  minCastLineFactor: 0.5,
  maxCastLineFactor: 1,

  /** Passive line payout while the lure is moving away (units/sec). */
  minCastPayoutSpeed: 260,
  maxCastPayoutSpeed: 820,
  sinkPayoutSpeed: 180,

  /** Reel-in line retraction speed (units/sec) before stat multipliers. */
  baseRetractSpeed: 320,

  /** Near-taut tolerance used to switch lure to hanging motion. */
  tautEpsilon: 0.75,
  /** Wider release tolerance prevents sink/hang flicker around taut threshold. */
  tautReleaseEpsilon: 7,
} as const
