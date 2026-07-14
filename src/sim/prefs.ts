/** Lightweight UI preferences (separate from game save so they're device-local). */

const REDUCE_MOTION_KEY = "yes-man-reduce-motion";
const CONTROLS_TIP_KEY = "yes-man-controls-tip-seen-v2";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, on: boolean): void {
  try {
    localStorage.setItem(key, on ? "1" : "0");
  } catch {
    /* private mode / quota — non-fatal */
  }
}

/** When on, the scene skips particle bursts and big tweens (accessibility). */
export function isReduceMotion(): boolean {
  return readFlag(REDUCE_MOTION_KEY);
}

export function setReduceMotion(on: boolean): void {
  writeFlag(REDUCE_MOTION_KEY, on);
}

/** One-time HUD hint for keyboard + settings — shown until first YES or auto-dismiss. */
export function hasSeenControlsTip(): boolean {
  return readFlag(CONTROLS_TIP_KEY);
}

export function markControlsTipSeen(): void {
  writeFlag(CONTROLS_TIP_KEY, true);
}
