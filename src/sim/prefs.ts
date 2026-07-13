/** Lightweight UI preferences (separate from game save so they're device-local). */

const REDUCE_MOTION_KEY = "yes-man-reduce-motion";

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
