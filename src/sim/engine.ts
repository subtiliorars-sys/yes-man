import {
  CASCADE_UPGRADE_INDEX,
  GEN_COST_GROWTH,
  GENERATOR_DEFS,
  MAX_PRESTIGES,
  PRESTIGE_THRESHOLD,
  PRESTIGE_THRESHOLD_GROWTH,
  PROMPTS,
  PROMPTS_TIER2,
  PROMPTS_TIER3,
  PROMPTS_TIER4,
  PROMPTS_TIER5,
  PROMPTS_TIER6,
  PROMPT_TIER2_THRESHOLD,
  PROMPT_TIER3_THRESHOLD,
  PROMPT_TIER4_THRESHOLD,
  PROMPT_TIER5_THRESHOLD,
  PROMPT_TIER6_THRESHOLD,
  PROMPT_CLICKS_MAX,
  PROMPT_CLICKS_MIN,
  GOLDEN_CPS_SECONDS,
  GOLDEN_CLICK_MULTIPLE,
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
    lifetimeGoldenYes: 0,
    playSeconds: 0,
    stampsEarned: [],
    runPeakCheer: 0,
    secretsFound: [],
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
  state.runPeakCheer = Math.max(state.runPeakCheer ?? 0, state.cheer);
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

export function promptPool(state: SimState): PromptDef[] {
  const pool = [...PROMPTS];
  if (state.totalCheerEarned >= PROMPT_TIER2_THRESHOLD) {
    pool.push(...PROMPTS_TIER2);
  }
  if (state.totalCheerEarned >= PROMPT_TIER3_THRESHOLD) {
    pool.push(...PROMPTS_TIER3);
  }
  if (state.totalCheerEarned >= PROMPT_TIER4_THRESHOLD) {
    pool.push(...PROMPTS_TIER4);
  }
  if (state.totalCheerEarned >= PROMPT_TIER5_THRESHOLD) {
    pool.push(...PROMPTS_TIER5);
  }
  if (state.totalCheerEarned >= PROMPT_TIER6_THRESHOLD) {
    pool.push(...PROMPTS_TIER6);
  }
  return pool;
}

/** Highest prompt tier unlocked by lifetime Cheer earned (1–6). */
export function promptTierUnlocked(totalCheerEarned: number): number {
  if (totalCheerEarned >= PROMPT_TIER6_THRESHOLD) return 6;
  if (totalCheerEarned >= PROMPT_TIER5_THRESHOLD) return 5;
  if (totalCheerEarned >= PROMPT_TIER4_THRESHOLD) return 4;
  if (totalCheerEarned >= PROMPT_TIER3_THRESHOLD) return 3;
  if (totalCheerEarned >= PROMPT_TIER2_THRESHOLD) return 2;
  return 1;
}

/** Reward for tapping a Golden Yes bubble — scales with engine progress. */
export function goldenYesReward(state: SimState): number {
  const fromCps = totalCps(state) * GOLDEN_CPS_SECONDS;
  const fromClick = clickMultiplier(state) * GOLDEN_CLICK_MULTIPLE;
  return Math.max(fromCps, fromClick);
}

/** Award a tapped Golden Yes. Returns Cheer gained. */
export function collectGoldenYes(state: SimState): number {
  const reward = goldenYesReward(state);
  addCheer(state, reward);
  state.lifetimeGoldenYes += 1;
  return reward;
}

export function nextPrompt(state: SimState): PromptDef {
  const pool = promptPool(state);
  if (state.nextPromptIndex < pool.length) {
    const p = pool[state.nextPromptIndex]!;
    state.nextPromptIndex += 1;
    return p;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? pool[0]!;
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

/** Reset run progress; keep prestige multiplier bump and prompt catalog progress (GDD). */
export function doPrestige(state: SimState): boolean {
  if (!canPrestige(state)) return false;
  state.prestiges += 1;
  state.prestigeMultiplier = 1 + state.prestiges * 0.25;
  state.cheer = 0;
  state.clickValue = 1;
  state.genOwned = GENERATOR_DEFS.map(() => 0);
  state.upgPurchased = UPGRADE_DEFS.map(() => false);
  state.clicksSincePrompt = 0;
  state.runPeakCheer = 0;
  return true;
}

/** Short-scale suffixes for the late/endgame economy (K → Decillion). */
const CHEER_SUFFIXES = [
  "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
] as const;

export function formatCheer(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n < 0) return `-${formatCheer(-n)}`;
  if (n < 10) return n.toFixed(1);
  if (n < 1e3) return Math.floor(n).toLocaleString();

  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= CHEER_SUFFIXES.length) {
    // Beyond Decillion: fall back to scientific so the UI never overflows.
    return n.toExponential(2);
  }
  const scaled = n / Math.pow(10, tier * 3);
  // 1 decimal keeps the HUD compact; drop it for clean values like "5M".
  const text = scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1);
  return `${text}${CHEER_SUFFIXES[tier]}`;
}

/** Friendly "2h 14m" style duration for the stats screen. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86_400);
  const hours = Math.floor((s % 86_400) / 3_600);
  const mins = Math.floor((s % 3_600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
