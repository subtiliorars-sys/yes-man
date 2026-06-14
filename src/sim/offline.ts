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
export function applyOfflineProgress(
  state: SimState,
  lastSavedMs: number,
  nowMs: number = Date.now()
): number {
  const deltaSec = offlineSeconds(lastSavedMs, nowMs);
  if (deltaSec < 1) return 0;
  return tick(state, deltaSec);
}
