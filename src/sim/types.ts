export interface GeneratorDef {
  id: string;
  name: string;
  baseCost: number;
  baseCps: number;
  flavor: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  cost: number;
  desc: string;
}

export interface PromptDef {
  text: string;
  bonus: number;
  flavor: string;
}

export interface SimState {
  cheer: number;
  totalCheerEarned: number;
  clickValue: number;
  /** Per-generator owned counts, aligned to GENERATOR_DEFS order. */
  genOwned: number[];
  /** Per-upgrade purchased flags, aligned to UPGRADE_DEFS order. */
  upgPurchased: boolean[];
  prestiges: number;
  prestigeMultiplier: number;
  nextPromptIndex: number;
  clicksSincePrompt: number;
  /** Lifetime stats — persist across prestige (achievements). */
  lifetimeClicks: number;
  lifetimeCascades: number;
  /** Golden Yes bubbles tapped (lifetime). */
  lifetimeGoldenYes: number;
  /** Total seconds the game has been open (engagement / completion stat). */
  playSeconds: number;
  stampsEarned: string[];
  /** Discovered Easter-egg / secret IDs (persist across prestige). */
  secretsFound: string[];
}

export interface SaveEnvelope {
  version: 2;
  state: SimState;
  lastSavedMs: number;
}
