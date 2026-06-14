import { describe, it, expect } from "vitest";
import {
  acceptPrompt,
  buyGenerator,
  buyUpgrade,
  canPrestige,
  clickYes,
  collectGoldenYes,
  createState,
  doPrestige,
  formatCheer,
  formatDuration,
  generatorCost,
  goldenYesReward,
  nextPrompt,
  promptPool,
  tick,
  totalCps,
} from "./engine.js";
import {
  PROMPTS,
  PROMPTS_TIER2,
  PROMPTS_TIER3,
  PROMPTS_TIER4,
  PROMPTS_TIER5,
  PROMPTS_TIER6,
  PRESTIGE_THRESHOLD,
  PROMPT_TIER2_THRESHOLD,
  PROMPT_TIER3_THRESHOLD,
  PROMPT_TIER4_THRESHOLD,
  PROMPT_TIER6_THRESHOLD,
} from "./economy.js";

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

  it("prompt catalog matches prototype parity (YM-W4)", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(15);
  });

  it("tier 2 prompts join pool after cheer threshold (YM-W5)", () => {
    const s = createState();
    s.totalCheerEarned = PROMPT_TIER2_THRESHOLD - 1;
    expect(promptPool(s).length).toBe(PROMPTS.length);
    s.totalCheerEarned = PROMPT_TIER2_THRESHOLD;
    expect(promptPool(s).length).toBe(PROMPTS.length + PROMPTS_TIER2.length);
  });

  it("tier 3 and 4 prompts unlock at thresholds (YM-W7/W8)", () => {
    const s = createState();
    s.totalCheerEarned = PROMPT_TIER3_THRESHOLD - 1;
    expect(promptPool(s).length).toBe(PROMPTS.length + PROMPTS_TIER2.length);
    s.totalCheerEarned = PROMPT_TIER3_THRESHOLD;
    expect(promptPool(s).length).toBe(
      PROMPTS.length + PROMPTS_TIER2.length + PROMPTS_TIER3.length
    );
    s.totalCheerEarned = PROMPT_TIER4_THRESHOLD;
    expect(promptPool(s).length).toBe(
      PROMPTS.length + PROMPTS_TIER2.length + PROMPTS_TIER3.length + PROMPTS_TIER4.length
    );
    s.totalCheerEarned = PROMPT_TIER6_THRESHOLD;
    expect(promptPool(s).length).toBe(
      PROMPTS.length +
        PROMPTS_TIER2.length +
        PROMPTS_TIER3.length +
        PROMPTS_TIER4.length +
        PROMPTS_TIER5.length +
        PROMPTS_TIER6.length
    );
  });

  it("prestige keeps prompt catalog progress (GDD W19)", () => {
    const s = createState();
    s.totalCheerEarned = PRESTIGE_THRESHOLD;
    for (let i = 0; i < 5; i += 1) nextPrompt(s);
    expect(s.nextPromptIndex).toBe(5);
    expect(doPrestige(s)).toBe(true);
    expect(s.nextPromptIndex).toBe(5);
    expect(s.cheer).toBe(0);
    expect(s.runPeakCheer).toBe(0);
  });

  it("golden yes rewards at least 40 clicks and tracks lifetime taps", () => {
    const s = createState();
    expect(goldenYesReward(s)).toBeGreaterThanOrEqual(40);
    const before = s.cheer;
    const gained = collectGoldenYes(s);
    expect(gained).toBeGreaterThan(0);
    expect(s.cheer).toBeCloseTo(before + gained);
    expect(s.lifetimeGoldenYes).toBe(1);
  });

  it("golden yes scales with running CPS once generators are humming", () => {
    const s = createState();
    s.cheer = 100_000;
    for (let i = 0; i < 5; i += 1) buyGenerator(s, 6);
    expect(goldenYesReward(s)).toBeGreaterThan(totalCps(s) * 10);
  });

  it("formatCheer scales from raw counts to short-scale suffixes", () => {
    expect(formatCheer(5)).toBe("5.0");
    expect(formatCheer(950)).toBe("950");
    expect(formatCheer(1_500)).toBe("1.5K");
    expect(formatCheer(2_300_000)).toBe("2.3M");
    expect(formatCheer(7.2e9)).toBe("7.2B");
    expect(formatCheer(4.5e12)).toBe("4.5T");
    expect(formatCheer(Infinity)).toBe("∞");
  });

  it("formatDuration reads like a friendly clock", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(3_725)).toBe("1h 2m");
    expect(formatDuration(90_000)).toBe("1d 1h");
  });
});
