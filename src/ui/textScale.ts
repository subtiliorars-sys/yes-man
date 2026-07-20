import { getFontScale } from "../sim/prefs.js";

/** Scales a base pixel font size by the user's font-scale preference.
 * Returns a Phaser-style "Npx" string. No-op ("<n>px") at the default scale. */
export function scaledFontSize(basePx: number): string {
  return `${Math.round(basePx * getFontScale())}px`;
}
