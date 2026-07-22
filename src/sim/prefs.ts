/** Lightweight UI preferences (separate from game save so they're device-local). */

const REDUCE_MOTION_KEY = "yes-man-reduce-motion";
const CONTROLS_TIP_KEY = "yes-man-controls-tip-seen-v2";
const COLORBLIND_MODE_KEY = "yes-man-colorblind-mode";
const FONT_SCALE_KEY = "yes-man-font-scale";
const BUTTON_SKIN_KEY = "yes-man-button-skin";

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

/** When on, UI swaps red/green-reliant signals for a blue/orange-safe palette
 * plus a non-color (icon/text) cue — accessibility for color-vision deficiency. */
export function isColorblindMode(): boolean {
  return readFlag(COLORBLIND_MODE_KEY);
}

export function setColorblindMode(on: boolean): void {
  writeFlag(COLORBLIND_MODE_KEY, on);
}

/** Discrete font-size steps: index 0 = Normal, 1 = Large, 2 = Extra Large. */
export const FONT_SCALE_STEPS = [1, 1.15, 1.3] as const;
export const FONT_SCALE_LABELS = ["Normal", "Large", "Extra Large"] as const;

/** Current font-scale step index, clamped to a valid step (defaults to 0 / Normal). */
export function getFontScaleIndex(): number {
  try {
    const raw = Number.parseInt(localStorage.getItem(FONT_SCALE_KEY) ?? "0", 10);
    if (Number.isNaN(raw) || raw < 0 || raw >= FONT_SCALE_STEPS.length) return 0;
    return raw;
  } catch {
    return 0;
  }
}

export function setFontScaleIndex(index: number): void {
  const clamped = Math.max(0, Math.min(FONT_SCALE_STEPS.length - 1, Math.trunc(index)));
  try {
    localStorage.setItem(FONT_SCALE_KEY, String(clamped));
  } catch {
    /* private mode / quota — non-fatal */
  }
}

/** Multiplier for the current font-scale step (1 by default — no visual change). */
export function getFontScale(): number {
  return FONT_SCALE_STEPS[getFontScaleIndex()] ?? 1;
}

/** Selected YES-button cosmetic skin id (see sim/skins.ts). Defaults to "default";
 * whether it's actually unlocked for the current save is checked separately. */
export function getButtonSkin(): string {
  try {
    return localStorage.getItem(BUTTON_SKIN_KEY) ?? "default";
  } catch {
    return "default";
  }
}

export function setButtonSkin(id: string): void {
  try {
    localStorage.setItem(BUTTON_SKIN_KEY, id);
  } catch {
    /* private mode / quota — non-fatal */
  }
}

/** One-time HUD hint for keyboard + settings — shown until first YES or auto-dismiss. */
export function hasSeenControlsTip(): boolean {
  return readFlag(CONTROLS_TIP_KEY);
}

export function markControlsTipSeen(): void {
  writeFlag(CONTROLS_TIP_KEY, true);
}
