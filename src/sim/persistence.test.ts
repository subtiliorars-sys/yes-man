import { describe, it, expect, beforeEach } from "vitest";
import { createState, doPrestige, buyUpgrade } from "./engine.js";
import { tryLoad, trySave, clearSave, SAVE_KEY } from "./persistence.js";
import { PRESTIGE_THRESHOLD } from "./economy.js";

function memStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

describe("persistence", () => {
  let s: ReturnType<typeof memStorage>;

  beforeEach(() => {
    s = memStorage();
  });

  it("round-trips state through storage", () => {
    const state = createState();
    state.cheer = 1234;
    state.genOwned[0] = 2;
    state.stampsEarned = ["first_yes"];
    trySave(state, s);
    const loaded = tryLoad(s);
    expect(loaded?.state.cheer).toBe(1234);
    expect(loaded?.state.genOwned[0]).toBe(2);
    expect(loaded?.state.stampsEarned).toEqual(["first_yes"]);
  });

  it("returns null for missing or corrupt saves", () => {
    expect(tryLoad(s)).toBeNull();
    s.setItem(SAVE_KEY, "{not json");
    expect(tryLoad(s)).toBeNull();
  });

  it("preserves prestige progress", () => {
    const state = createState();
    state.totalCheerEarned = PRESTIGE_THRESHOLD;
    expect(doPrestige(state)).toBe(true);
    trySave(state, s);
    const loaded = tryLoad(s)!;
    expect(loaded.state.prestiges).toBe(1);
    expect(loaded.state.prestigeMultiplier).toBeGreaterThan(1);
  });

  it("preserves purchased upgrades", () => {
    const state = createState();
    state.cheer = 500;
    buyUpgrade(state, 0);
    trySave(state, s);
    expect(tryLoad(s)?.state.upgPurchased[0]).toBe(true);
  });

  it("migrates v1-shaped saves without stamps fields", () => {
    s.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          cheer: 50,
          totalCheerEarned: 50,
          clickValue: 1,
          genOwned: [0, 0, 0, 0, 0, 0, 0],
          upgPurchased: [false, false, false, false, false, false, false, false],
          prestiges: 0,
          prestigeMultiplier: 1,
          nextPromptIndex: 0,
          clicksSincePrompt: 0,
        },
      })
    );
    const loaded = tryLoad(s);
    expect(loaded?.state.stampsEarned).toEqual([]);
    expect(loaded?.state.lifetimeClicks).toBe(0);
  });

  it("clearSave removes stored game data", () => {
    const state = createState();
    state.cheer = 99;
    trySave(state, s);
    expect(s.map.has(SAVE_KEY)).toBe(true);
    clearSave(s);
    expect(tryLoad(s)).toBeNull();
  });
});
