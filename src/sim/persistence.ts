import type { SaveEnvelope, SimState } from "./types.js";
import { createState } from "./engine.js";
import { GENERATOR_DEFS, UPGRADE_DEFS } from "./economy.js";

export const SAVE_KEY = "yesman_save_v1";

export function serializeState(state: SimState): SaveEnvelope {
  return {
    version: 1,
    state: {
      ...state,
      genOwned: [...state.genOwned],
      upgPurchased: [...state.upgPurchased],
    },
  };
}

export function trySave(state: SimState, storage?: Pick<Storage, "setItem">): void {
  if (!storage) return;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(serializeState(state)));
  } catch {
    /* quota / private mode — non-fatal */
  }
}

export function tryLoad(storage?: Pick<Storage, "getItem">): SimState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveEnvelope;
    if (data.version !== 1 || !data.state) return null;
    const s = data.state;
    if (
      typeof s.cheer !== "number" ||
      !Array.isArray(s.genOwned) ||
      !Array.isArray(s.upgPurchased)
    ) {
      return null;
    }
    const base = createState();
    return {
      ...base,
      cheer: Math.max(0, s.cheer),
      totalCheerEarned: Math.max(0, s.totalCheerEarned ?? 0),
      clickValue: Math.max(1, s.clickValue ?? 1),
      genOwned: GENERATOR_DEFS.map((_, i) => Math.max(0, s.genOwned[i] ?? 0)),
      upgPurchased: UPGRADE_DEFS.map((_, i) => Boolean(s.upgPurchased[i])),
      prestiges: Math.max(0, s.prestiges ?? 0),
      prestigeMultiplier: Math.max(1, s.prestigeMultiplier ?? 1),
      nextPromptIndex: Math.max(0, s.nextPromptIndex ?? 0),
      clicksSincePrompt: Math.max(0, s.clicksSincePrompt ?? 0),
    };
  } catch {
    return null;
  }
}
