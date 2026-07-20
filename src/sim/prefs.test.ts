import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FONT_SCALE_STEPS,
  getFontScale,
  getFontScaleIndex,
  hasSeenControlsTip,
  isColorblindMode,
  isReduceMotion,
  markControlsTipSeen,
  setColorblindMode,
  setFontScaleIndex,
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

  it("defaults colorblind mode to off", () => {
    expect(isColorblindMode()).toBe(false);
  });

  it("persists the colorblind mode flag", () => {
    setColorblindMode(true);
    expect(isColorblindMode()).toBe(true);
    setColorblindMode(false);
    expect(isColorblindMode()).toBe(false);
  });

  it("defaults font scale to Normal (index 0, multiplier 1)", () => {
    expect(getFontScaleIndex()).toBe(0);
    expect(getFontScale()).toBe(1);
  });

  it("persists the font scale index and reflects its multiplier", () => {
    setFontScaleIndex(1);
    expect(getFontScaleIndex()).toBe(1);
    expect(getFontScale()).toBe(FONT_SCALE_STEPS[1]);

    setFontScaleIndex(2);
    expect(getFontScaleIndex()).toBe(2);
    expect(getFontScale()).toBe(FONT_SCALE_STEPS[2]);
  });

  it("clamps out-of-range font scale indexes", () => {
    setFontScaleIndex(-5);
    expect(getFontScaleIndex()).toBe(0);
    setFontScaleIndex(99);
    expect(getFontScaleIndex()).toBe(FONT_SCALE_STEPS.length - 1);
  });

  it("round-trips through export/import-style persistence (localStorage)", () => {
    setColorblindMode(true);
    setFontScaleIndex(2);
    // Simulate a fresh page load reading from the same localStorage backing.
    expect(isColorblindMode()).toBe(true);
    expect(getFontScaleIndex()).toBe(2);
  });
});
