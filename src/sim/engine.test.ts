import { describe, it, expect } from "vitest";
import {
  acceptPrompt,
  buyGenerator,
  buyUpgrade,
  canPrestige,
  clickYes,
  createState,
  generatorCost,
  nextPrompt,
  tick,
  totalCps,
} from "./engine.js";
import { PROMPTS } from "./economy.js";

describe("yes-man engine", () => {
  it("click adds cheer at base click value", () => {
    const s = createState();
    const r = clickYes(s, () => 0.99);
    expect(r.cheerGained).toBe(1);
    expect(s.cheer).toBe(1);
  });

  it("generator purchase increases CPS", () => {
    const s = createState();
    s.cheer = 100;
    expect(buyGenerator(s, 0)).toBe(true);
    expect(totalCps(s)).toBeGreaterThan(0);
    expect(generatorCost(0, s)).toBeGreaterThan(15);
  });

  it("tick accrues passive cheer from generators", () => {
    const s = createState();
    s.cheer = 100;
    buyGenerator(s, 0);
    const before = s.cheer;
    tick(s, 10);
    expect(s.cheer).toBeGreaterThan(before);
  });

  it("prompt accept awards bonus cheer", () => {
    const s = createState();
    const p = PROMPTS[0]!;
    const bonus = acceptPrompt(s, p);
    expect(bonus).toBe(p.bonus);
    expect(s.cheer).toBe(p.bonus);
  });

  it("upgrade purchase gates on cost", () => {
    const s = createState();
    expect(buyUpgrade(s, 0)).toBe(false);
    s.cheer = 200;
    expect(buyUpgrade(s, 0)).toBe(true);
    const gained = clickYes(s, () => 0.5).cheerGained;
    expect(gained).toBeGreaterThan(1);
  });

  it("prestige unlocks at total earned threshold", () => {
    const s = createState();
    s.totalCheerEarned = 99_999;
    expect(canPrestige(s)).toBe(false);
    s.totalCheerEarned = 100_000;
    expect(canPrestige(s)).toBe(true);
  });

  it("prompt index cycles through catalog then random", () => {
    const s = createState();
    const first = nextPrompt(s);
    expect(first.text).toBe(PROMPTS[0]!.text);
    expect(s.nextPromptIndex).toBe(1);
  });
});
