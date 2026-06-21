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
  stampsEarned: string[];
  /** Peak Cheer held in the current run (resets on prestige). */
  runPeakCheer: number;
}

export interface SaveEnvelope {
  version: 2;
  state: SimState;
  lastSavedMs: number;
}
