import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasSeenControlsTip,
  isReduceMotion,
  markControlsTipSeen,
  setReduceMotion,
} from "./prefs.js";

describe("ui prefs", () => {
  beforeEach(() => {
    const map = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      clear: () => map.clear(),
    });
  });

  it("defaults reduce-motion to off", () => {
    expect(isReduceMotion()).toBe(false);
  });

  it("persists the reduce-motion flag", () => {
    setReduceMotion(true);
    expect(isReduceMotion()).toBe(true);
    setReduceMotion(false);
    expect(isReduceMotion()).toBe(false);
  });

  it("defaults controls tip to unseen", () => {
    expect(hasSeenControlsTip()).toBe(false);
  });

  it("persists controls tip seen", () => {
    markControlsTipSeen();
    expect(hasSeenControlsTip()).toBe(true);
  });
});
