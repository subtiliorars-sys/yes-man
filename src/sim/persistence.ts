import type { SaveEnvelope, SimState } from "./types.js";
import { createState } from "./engine.js";
import { GENERATOR_DEFS, UPGRADE_DEFS } from "./economy.js";
import { applyOfflineProgress } from "./offline.js";

export const SAVE_KEY = "yesman_save_v1";

export interface LoadResult {
  state: SimState;
  offlineEarned: number;
}

function normalizeState(raw: Partial<SimState>): SimState {
  const base = createState();
  return {
    ...base,
    cheer: Math.max(0, raw.cheer ?? 0),
    totalCheerEarned: Math.max(0, raw.totalCheerEarned ?? 0),
    clickValue: Math.max(1, raw.clickValue ?? 1),
    genOwned: GENERATOR_DEFS.map((_, i) => Math.max(0, raw.genOwned?.[i] ?? 0)),
    upgPurchased: UPGRADE_DEFS.map((_, i) => Boolean(raw.upgPurchased?.[i])),
    prestiges: Math.max(0, raw.prestiges ?? 0),
    prestigeMultiplier: Math.max(1, raw.prestigeMultiplier ?? 1),
    nextPromptIndex: Math.max(0, raw.nextPromptIndex ?? 0),
    clicksSincePrompt: Math.max(0, raw.clicksSincePrompt ?? 0),
    lifetimeClicks: Math.max(0, raw.lifetimeClicks ?? 0),
    lifetimeCascades: Math.max(0, raw.lifetimeCascades ?? 0),
    stampsEarned: Array.isArray(raw.stampsEarned)
      ? raw.stampsEarned.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export function serializeState(state: SimState, nowMs: number = Date.now()): SaveEnvelope {
  return {
    version: 2,
    lastSavedMs: nowMs,
    state: {
      ...state,
      genOwned: [...state.genOwned],
      upgPurchased: [...state.upgPurchased],
      stampsEarned: [...state.stampsEarned],
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

export function tryLoad(storage?: Pick<Storage, "getItem">): LoadResult | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveEnvelope & { version?: number };
    if (!data.state) return null;
    const state = normalizeState(data.state);
    const lastSavedMs =
      typeof data.lastSavedMs === "number" && data.version === 2
        ? data.lastSavedMs
        : 0;
    const offlineEarned = applyOfflineProgress(state, lastSavedMs);
    return { state, offlineEarned };
  } catch {
    return null;
  }
}
