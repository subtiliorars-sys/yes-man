import { describe, it, expect, beforeEach } from "vitest";
import { createState, doPrestige, buyUpgrade } from "./engine.js";
import { tryLoad, trySave, SAVE_KEY } from "./persistence.js";
import { PRESTIGE_THRESHOLD } from "./economy.js";

function memStorage(): Pick<Storage, "getItem" | "setItem"> & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, v),
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
    trySave(state, s);
    const loaded = tryLoad(s);
    expect(loaded?.cheer).toBe(1234);
    expect(loaded?.genOwned[0]).toBe(2);
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
    expect(loaded.prestiges).toBe(1);
    expect(loaded.prestigeMultiplier).toBeGreaterThan(1);
  });

  it("preserves purchased upgrades", () => {
    const state = createState();
    state.cheer = 500;
    buyUpgrade(state, 0);
    trySave(state, s);
    expect(tryLoad(s)?.upgPurchased[0]).toBe(true);
  });
});
