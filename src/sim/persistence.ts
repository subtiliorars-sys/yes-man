import type { SaveEnvelope, SimState } from "./types.js";
import { createState } from "./engine.js";
import { GENERATOR_DEFS, UPGRADE_DEFS } from "./economy.js";
import { applyOfflineProgress, offlineSeconds } from "./offline.js";

export const SAVE_KEY = "yesman_save_v1";

export interface LoadResult {
  state: SimState;
  offlineEarned: number;
  /** Seconds the player was away since last save (0 for fresh/legacy saves). */
  offlineSeconds: number;
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
    lifetimeGoldenYes: Math.max(0, raw.lifetimeGoldenYes ?? 0),
    playSeconds: Math.max(0, raw.playSeconds ?? 0),
    stampsEarned: Array.isArray(raw.stampsEarned)
      ? raw.stampsEarned.filter((id): id is string => typeof id === "string")
      : [],
    secretsFound: Array.isArray(raw.secretsFound)
      ? raw.secretsFound.filter((id): id is string => typeof id === "string")
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

/** Human-portable backup string (base64 of the save envelope). */
export function exportSave(state: SimState, nowMs: number = Date.now()): string {
  const json = JSON.stringify(serializeState(state, nowMs));
  if (typeof btoa === "function") {
    // Encode UTF-8 safely before base64 so emoji in stamp ids survive.
    return btoa(unescape(encodeURIComponent(json)));
  }
  return json;
}

/** Parse a backup string from {@link exportSave}. Returns null if invalid. */
export function importSave(text: string): SimState | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const candidates: string[] = [trimmed];
  if (typeof atob === "function") {
    try {
      candidates.push(decodeURIComponent(escape(atob(trimmed))));
    } catch {
      /* not base64 — fall through to raw JSON attempt */
    }
  }
  for (const candidate of candidates) {
    try {
      const data = JSON.parse(candidate) as Partial<SaveEnvelope>;
      if (data && data.state) return normalizeState(data.state);
    } catch {
      /* try next candidate */
    }
  }
  return null;
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
    return { state, offlineEarned, offlineSeconds: offlineSeconds(lastSavedMs) };
  } catch {
    return null;
  }
}
