import { describe, expect, it } from "vitest";
import { createState, buyGenerator, totalCps } from "./engine.js";
import { applyOfflineProgress } from "./offline.js";

describe("offline progress", () => {
  it("accrues passive cheer from generators while away", () => {
    const s = createState();
    s.cheer = 100;
    buyGenerator(s, 0);
    expect(totalCps(s)).toBeGreaterThan(0);
    const earned = applyOfflineProgress(s, Date.now() - 60_000, Date.now());
    expect(earned).toBeGreaterThan(0);
    expect(s.cheer).toBeGreaterThan(100);
  });

  it("returns zero for fresh save timestamps", () => {
    const s = createState();
    expect(applyOfflineProgress(s, 0)).toBe(0);
  });
});
