import { tick } from "./engine.js";
import type { SimState } from "./types.js";

/** Max offline accrual window — generous, not punitive (GDD P2). */
export const MAX_OFFLINE_SECONDS = 30 * 24 * 3600;

/** Seconds elapsed since last save, clamped to the offline window. */
export function offlineSeconds(
  lastSavedMs: number,
  nowMs: number = Date.now()
): number {
  if (!Number.isFinite(lastSavedMs) || lastSavedMs <= 0) return 0;
  const deltaMs = Math.max(0, nowMs - lastSavedMs);
  return Math.min(deltaMs / 1000, MAX_OFFLINE_SECONDS);
}

/**
 * Apply passive Cheer earned while the tab was closed.
 * Returns Cheer accrued (for welcome-back UI).
 */
export function formatAwayTime(seconds: number): string {
  if (seconds < 60) return "a minute";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

export function applyOfflineProgress(
  state: SimState,
  lastSavedMs: number,
  nowMs: number = Date.now()
): number {
  const deltaSec = offlineSeconds(lastSavedMs, nowMs);
  if (deltaSec < 1) return 0;
  return tick(state, deltaSec);
}
