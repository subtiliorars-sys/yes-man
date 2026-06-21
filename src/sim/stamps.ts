import type { SimState } from "./types.js";
import {
  GENERATOR_DEFS,
  PROMPTS,
  PROMPT_TIER3_THRESHOLD,
  PROMPT_TIER4_THRESHOLD,
  PROMPT_TIER5_THRESHOLD,
  PROMPT_TIER6_THRESHOLD,
} from "./economy.js";
import { promptPool } from "./engine.js";
export interface StampDef {
  id: string;
  label: string;
  icon: string;
}

/** Milestone stamps — no missables; persist across prestige (GDD achievements). */
export const STAMP_DEFS: readonly StampDef[] = [
  { id: "first_yes", label: "1st Yes", icon: "👆" },
  { id: "first_gen", label: "1st Gen", icon: "🐕" },
  { id: "three_gens", label: "3 Gens", icon: "🤖" },
  { id: "all_gens", label: "All 7", icon: "🌌" },
  { id: "prestige", label: "Prestige", icon: "✨" },
  { id: "cascade", label: "Cascade", icon: "🌊" },
  { id: "total_1k", label: "1K Total", icon: "💛" },
  { id: "total_10k", label: "10K Total", icon: "🧡" },
  { id: "total_100k", label: "100K Total", icon: "❤️" },
  { id: "total_1m", label: "1M Total", icon: "💎" },
  { id: "prompts_seen", label: "All Prompts", icon: "📬" },
  { id: "tier3_unlock", label: "Weird Yes", icon: "🎭" },
  { id: "tier4_unlock", label: "Heart Yes", icon: "💝" },
  { id: "tier5_unlock", label: "Cosmic Yes", icon: "🌠" },
  { id: "tier6_unlock", label: "Meta Yes", icon: "🪞" },
  { id: "veteran_yes", label: "5 Prestige", icon: "🏅" },
  { id: "yes_sage", label: "10 Prestige", icon: "🧘" },
  { id: "overflow_run", label: "1M Run", icon: "🌊" },
  { id: "clicks_1k", label: "1K Clicks", icon: "👍" },
];

function qualifies(state: SimState, id: string): boolean {
  switch (id) {
    case "first_yes":
      return state.lifetimeClicks >= 1;
    case "first_gen":
      return state.genOwned.some((n) => n > 0);
    case "three_gens":
      return state.genOwned.filter((n) => n > 0).length >= 3;
    case "all_gens":
      return GENERATOR_DEFS.every((_, i) => (state.genOwned[i] ?? 0) > 0);
    case "prestige":
      return state.prestiges >= 1;
    case "cascade":
      return state.lifetimeCascades >= 1;
    case "total_1k":
      return state.totalCheerEarned >= 1_000;
    case "total_10k":
      return state.totalCheerEarned >= 10_000;
    case "total_100k":
      return state.totalCheerEarned >= 100_000;
    case "total_1m":
      return state.totalCheerEarned >= 1_000_000;
    case "prompts_seen": {
      const fullPool = promptPool(state).length;
      return state.nextPromptIndex >= fullPool && fullPool >= PROMPTS.length;
    }
    case "tier3_unlock":
      return state.totalCheerEarned >= PROMPT_TIER3_THRESHOLD;
    case "tier4_unlock":
      return state.totalCheerEarned >= PROMPT_TIER4_THRESHOLD;
    case "tier5_unlock":
      return state.totalCheerEarned >= PROMPT_TIER5_THRESHOLD;
    case "tier6_unlock":
      return state.totalCheerEarned >= PROMPT_TIER6_THRESHOLD;
    case "veteran_yes":
      return state.prestiges >= 5;
    case "yes_sage":
      return state.prestiges >= 10;
    case "overflow_run":
      return (state.runPeakCheer ?? 0) >= 1_000_000;
    case "clicks_1k":
      return state.lifetimeClicks >= 1_000;
    default:
      return false;
  }
}

/** Returns stamp IDs newly earned this check; mutates `state.stampsEarned`. */
export function refreshStamps(state: SimState): string[] {
  const earned = new Set(state.stampsEarned);
  const fresh: string[] = [];
  for (const def of STAMP_DEFS) {
    if (earned.has(def.id)) continue;
    if (!qualifies(state, def.id)) continue;
    earned.add(def.id);
    fresh.push(def.id);
  }
  state.stampsEarned = [...earned];
  return fresh;
}

export function stampById(id: string): StampDef | undefined {
  return STAMP_DEFS.find((s) => s.id === id);
}

export function earnedStampCount(state: SimState): number {
  return state.stampsEarned.length;
}
