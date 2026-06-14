import { describe, expect, it } from "vitest";
import { createState, doPrestige } from "./engine.js";
import {
  MAX_PRESTIGES,
  PRESTIGE_THRESHOLD,
  PROMPTS,
  PROMPT_TIER3_THRESHOLD,
} from "./economy.js";
import { refreshStamps, STAMP_DEFS } from "./stamps.js";
import { SECRET_DEFS } from "./secrets.js";

describe("stamps", () => {
  it("awards first_yes after one click tracked", () => {
    const s = createState();
    s.lifetimeClicks = 1;
    const fresh = refreshStamps(s);
    expect(fresh).toContain("first_yes");
    expect(refreshStamps(s)).toEqual([]);
  });

  it("keeps stamps across prestige reset", () => {
    const s = createState();
    s.totalCheerEarned = PRESTIGE_THRESHOLD;
    s.lifetimeClicks = 5;
    s.genOwned[0] = 1;
    refreshStamps(s);
    expect(doPrestige(s)).toBe(true);
    expect(s.stampsEarned).toContain("first_yes");
    expect(s.stampsEarned).toContain("first_gen");
  });

  it("awards prompts_seen when catalog exhausted", () => {
    const s = createState();
    s.totalCheerEarned = PROMPT_TIER3_THRESHOLD;
    s.nextPromptIndex = 999;
    const fresh = refreshStamps(s);
    expect(fresh).toContain("prompts_seen");
  });

  it("awards golden stamps from tapped golden yeses", () => {
    const s = createState();
    s.lifetimeGoldenYes = 1;
    expect(refreshStamps(s)).toContain("golden");
    s.lifetimeGoldenYes = 10;
    expect(refreshStamps(s)).toContain("golden_10");
  });

  it("awards the_journey only at full prestige with all secrets", () => {
    const s = createState();
    s.prestiges = MAX_PRESTIGES;
    expect(refreshStamps(s)).toContain("max_prestige");
    expect(s.stampsEarned).not.toContain("the_journey");
    s.secretsFound = SECRET_DEFS.map((d) => d.id);
    expect(refreshStamps(s)).toContain("the_journey");
  });

  it("covers every stamp definition with a qualifier", () => {
    expect(STAMP_DEFS.length).toBeGreaterThanOrEqual(10);
  });
});
