import { describe, expect, it } from "vitest";
import { createState } from "./engine.js";
import { SKIN_DEFS, isSkinUnlocked, skinById, unlockedSkins } from "./skins.js";

describe("skins", () => {
  it("default skin is always unlocked, even on a brand-new state", () => {
    const s = createState();
    expect(isSkinUnlocked(s, "default")).toBe(true);
    expect(unlockedSkins(s).map((d) => d.id)).toEqual(["default"]);
  });

  it("unlocks a skin once its required stamp is earned", () => {
    const s = createState();
    expect(isSkinUnlocked(s, "mint")).toBe(false);
    s.stampsEarned = ["first_gen"];
    expect(isSkinUnlocked(s, "mint")).toBe(true);
  });

  it("returns false for an unknown skin id", () => {
    const s = createState();
    expect(isSkinUnlocked(s, "not-a-real-skin")).toBe(false);
  });

  it("unlockedSkins grows monotonically as more stamps are earned, in defined order", () => {
    const s = createState();
    s.stampsEarned = ["first_gen", "prestige"];
    const ids = unlockedSkins(s).map((d) => d.id);
    expect(ids).toEqual(["default", "mint", "rose"]);
  });

  it("unlocks every skin once every required stamp is earned", () => {
    const s = createState();
    s.stampsEarned = SKIN_DEFS.map((d) => d.requiresStamp).filter(
      (id): id is string => id !== null
    );
    expect(unlockedSkins(s)).toHaveLength(SKIN_DEFS.length);
  });

  it("skinById finds a definition by id and is undefined for garbage", () => {
    expect(skinById("default")?.label).toBe("Classic Amber");
    expect(skinById("nope")).toBeUndefined();
  });

  it("every skin (other than default) requires a real stamp gate — no free rides", () => {
    for (const def of SKIN_DEFS) {
      if (def.id === "default") {
        expect(def.requiresStamp).toBeNull();
      } else {
        expect(def.requiresStamp).not.toBeNull();
      }
    }
  });
});
