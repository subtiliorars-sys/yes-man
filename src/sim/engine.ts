import {
  CASCADE_UPGRADE_INDEX,
  GEN_COST_GROWTH,
  GENERATOR_DEFS,
  MAX_PRESTIGES,
  PRESTIGE_THRESHOLD,
  PRESTIGE_THRESHOLD_GROWTH,
  PROMPTS,
  PROMPT_CLICKS_MAX,
  PROMPT_CLICKS_MIN,
  SYNERGY_UPGRADE_INDEX,
  UPGRADE_DEFS,
} from "./economy.js";
import type { PromptDef, SimState } from "./types.js";

export function createState(): SimState {
  return {
    cheer: 0,
    totalCheerEarned: 0,
    clickValue: 1,
    genOwned: GENERATOR_DEFS.map(() => 0),
    upgPurchased: UPGRADE_DEFS.map(() => false),
    prestiges: 0,
    prestigeMultiplier: 1,
    nextPromptIndex: 0,
    clicksSincePrompt: 0,
    lifetimeClicks: 0,
    lifetimeCascades: 0,
    stampsEarned: [],
  };
}

export function generatorCost(index: number, state: SimState): number {
  const def = GENERATOR_DEFS[index];
  if (!def) return Infinity;
  const owned = state.genOwned[index] ?? 0;
  return Math.floor(def.baseCost * Math.pow(GEN_COST_GROWTH, owned));
}

function generatorCpsMultiplier(state: SimState): number {
  let mult = 1;
  if (state.upgPurchased[1]) mult *= 1.5;
  if (state.upgPurchased[3]) mult *= 2;
  return mult;
}

function clickMultiplier(state: SimState): number {
  let mult = state.clickValue * state.prestigeMultiplier;
  if (state.upgPurchased[0]) mult *= 2;
  if (state.upgPurchased[2]) mult *= 3;
  if (state.upgPurchased[4]) mult *= 5;
  if (state.upgPurchased[7]) mult *= 10;
  return mult;
}

export function totalCps(state: SimState): number {
  const ownedTypes = state.genOwned.filter((n) => n > 0).length;
  const baseMult = generatorCpsMultiplier(state) * state.prestigeMultiplier;
  let cps = 0;
  for (let i = 0; i < GENERATOR_DEFS.length; i++) {
    const owned = state.genOwned[i] ?? 0;
    if (owned <= 0) continue;
    const def = GENERATOR_DEFS[i]!;
    let line = def.baseCps * owned * baseMult;
    if (state.upgPurchased[SYNERGY_UPGRADE_INDEX] && ownedTypes > 0) {
      line *= 1 + 0.1 * (ownedTypes - 1);
    }
    cps += line;
  }
  return cps;
}

function addCheer(state: SimState, amount: number): void {
  if (amount <= 0) return;
  state.cheer += amount;
  state.totalCheerEarned += amount;
}

export interface ClickResult {
  cheerGained: number;
  cascadeTriggered: boolean;
  promptReady: boolean;
  activePrompt: PromptDef | null;
}

export function clickYes(state: SimState, rng: () => number = Math.random): ClickResult {
  let cheerGained = clickMultiplier(state);
  let cascadeTriggered = false;
  if (state.upgPurchased[CASCADE_UPGRADE_INDEX] && rng() < 0.05) {
    cascadeTriggered = true;
    state.lifetimeCascades += 1;
    cheerGained += clickMultiplier(state) * 10;
  }
  addCheer(state, cheerGained);
  state.lifetimeClicks += 1;
  state.clicksSincePrompt += 1;

  const threshold =
    PROMPT_CLICKS_MIN +
    Math.floor(rng() * (PROMPT_CLICKS_MAX - PROMPT_CLICKS_MIN + 1));
  const promptReady = state.clicksSincePrompt >= threshold;
  return { cheerGained, cascadeTriggered, promptReady, activePrompt: null };
}

export function nextPrompt(state: SimState): PromptDef {
  if (state.nextPromptIndex < PROMPTS.length) {
    const p = PROMPTS[state.nextPromptIndex]!;
    state.nextPromptIndex += 1;
    return p;
  }
  const idx = Math.floor(Math.random() * PROMPTS.length);
  return PROMPTS[idx] ?? PROMPTS[0]!;
}

export function acceptPrompt(state: SimState, prompt: PromptDef): number {
  const bonus = prompt.bonus * state.prestigeMultiplier;
  addCheer(state, bonus);
  state.clicksSincePrompt = 0;
  return bonus;
}

export function tick(state: SimState, dtSeconds: number): number {
  const earned = totalCps(state) * dtSeconds;
  if (earned > 0) addCheer(state, earned);
  return earned;
}

export function buyGenerator(state: SimState, index: number): boolean {
  const cost = generatorCost(index, state);
  if (state.cheer < cost) return false;
  state.cheer -= cost;
  state.genOwned[index] = (state.genOwned[index] ?? 0) + 1;
  return true;
}

export function buyUpgrade(state: SimState, index: number): boolean {
  const def = UPGRADE_DEFS[index];
  if (!def || state.upgPurchased[index]) return false;
  if (state.cheer < def.cost) return false;
  state.cheer -= def.cost;
  state.upgPurchased[index] = true;
  return true;
}

export function prestigeThreshold(state: SimState): number {
  return PRESTIGE_THRESHOLD * Math.pow(PRESTIGE_THRESHOLD_GROWTH, state.prestiges);
}

export function canPrestige(state: SimState): boolean {
  return (
    state.prestiges < MAX_PRESTIGES &&
    state.totalCheerEarned >= prestigeThreshold(state)
  );
}

/** Reset run progress; keep prestige multiplier bump. Ethics: optional, never punishing. */
export function doPrestige(state: SimState): boolean {
  if (!canPrestige(state)) return false;
  state.prestiges += 1;
  state.prestigeMultiplier = 1 + state.prestiges * 0.25;
  state.cheer = 0;
  state.clickValue = 1;
  state.genOwned = GENERATOR_DEFS.map(() => 0);
  state.upgPurchased = UPGRADE_DEFS.map(() => false);
  state.nextPromptIndex = 0;
  state.clicksSincePrompt = 0;
  return true;
}

export function formatCheer(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (n >= 10) return Math.floor(n).toLocaleString();
  return n.toFixed(1);
}
