import type { SimState } from "./types.js";

export interface SkinDef {
  id: string;
  label: string;
  /** YES-button fill color (hex, matches Phaser's 0xRRGGBB circle fill). */
  fill: number;
  /** YES-button ring/stroke color. */
  stroke: number;
  /** Stamp id required to unlock, or null if unlocked from the start. Purely
   * cosmetic — reuses existing stamp milestones, no new grind. */
  requiresStamp: string | null;
}

/** Cosmetic YES-button color skins. No gameplay effect, no purchase — unlocked
 * by reaching existing stamp milestones (GDD: no dark patterns, no monetization). */
export const SKIN_DEFS: readonly SkinDef[] = [
  { id: "default", label: "Classic Amber", fill: 0xffb347, stroke: 0xff8c00, requiresStamp: null },
  { id: "mint", label: "Mint", fill: 0x7fd8be, stroke: 0x2f9e79, requiresStamp: "first_gen" },
  { id: "violet", label: "Violet", fill: 0xb39ddb, stroke: 0x7e57c2, requiresStamp: "all_gens" },
  { id: "rose", label: "Rose", fill: 0xf48fb1, stroke: 0xd81b60, requiresStamp: "prestige" },
  { id: "radiant", label: "Radiant Gold", fill: 0xffd700, stroke: 0xdaa520, requiresStamp: "max_prestige" },
];

export function skinById(id: string): SkinDef | undefined {
  return SKIN_DEFS.find((s) => s.id === id);
}

/** A skin is unlocked once its required stamp (if any) has been earned. */
export function isSkinUnlocked(state: SimState, id: string): boolean {
  const def = skinById(id);
  if (!def) return false;
  if (def.requiresStamp === null) return true;
  return state.stampsEarned.includes(def.requiresStamp);
}

/** Skins currently available to the player, in defined order. */
export function unlockedSkins(state: SimState): SkinDef[] {
  return SKIN_DEFS.filter((s) => isSkinUnlocked(state, s.id));
}
