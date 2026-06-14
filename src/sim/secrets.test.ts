import { describe, expect, it } from "vitest";
import { createState, doPrestige } from "./engine.js";
import { PRESTIGE_THRESHOLD } from "./economy.js";
import {
  SECRET_COUNT,
  SECRET_DEFS,
  discoverSecret,
  evaluatePassiveSecrets,
  foundSecretCount,
  hasSecret,
} from "./secrets.js";

describe("secrets / easter eggs", () => {
  it("discovers a secret exactly once", () => {
    const s = createState();
    const first = discoverSecret(s, "konami");
    expect(first?.id).toBe("konami");
    expect(hasSecret(s, "konami")).toBe(true);
    expect(discoverSecret(s, "konami")).toBeNull();
    expect(foundSecretCount(s)).toBe(1);
  });

  it("ignores unknown ids and never throws", () => {
    const s = createState();
    expect(discoverSecret(s, "not-a-real-secret")).toBeNull();
    expect(foundSecretCount(s)).toBe(0);
  });

  it("counts only valid ids, surviving hand-edited saves", () => {
    const s = createState();
    s.secretsFound = ["konami", "garbage", "night_owl"];
    expect(foundSecretCount(s)).toBe(2);
  });

  it("keeps discovered secrets across prestige", () => {
    const s = createState();
    s.totalCheerEarned = PRESTIGE_THRESHOLD;
    discoverSecret(s, "good_dog");
    expect(doPrestige(s)).toBe(true);
    expect(hasSecret(s, "good_dog")).toBe(true);
  });

  it("evaluatePassiveSecrets finds state-implied secrets once", () => {
    const s = createState();
    const day = { localHour: 13, offlineSeconds: 0 };
    expect(evaluatePassiveSecrets(s, day)).toEqual([]);

    s.lifetimeClicks = 777;
    s.genOwned[0] = 42; // 42 total gens AND 25+ dogs
    const fresh = evaluatePassiveSecrets(s, day).map((d) => d.id);
    expect(fresh).toContain("lucky_sevens");
    expect(fresh).toContain("the_answer");
    expect(fresh).toContain("good_dog");
    // Idempotent — nothing new on a second pass.
    expect(evaluatePassiveSecrets(s, day)).toEqual([]);
  });

  it("finds night_owl after midnight and long_haul after a day away", () => {
    const s = createState();
    expect(
      evaluatePassiveSecrets(s, { localHour: 2, offlineSeconds: 0 }).map((d) => d.id)
    ).toContain("night_owl");
    expect(
      evaluatePassiveSecrets(s, { localHour: 12, offlineSeconds: 90_000 }).map(
        (d) => d.id
      )
    ).toContain("long_haul");
  });

  it("every secret def has a reveal line and unique id", () => {
    const ids = new Set(SECRET_DEFS.map((d) => d.id));
    expect(ids.size).toBe(SECRET_COUNT);
    for (const def of SECRET_DEFS) {
      expect(def.reveal.length).toBeGreaterThan(0);
      expect(def.label.length).toBeGreaterThan(0);
    }
  });
});
