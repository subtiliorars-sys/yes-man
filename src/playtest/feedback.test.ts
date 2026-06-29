import { describe, expect, it } from "vitest";
import {
  addDesignVote,
  addFeedbackSubmission,
  buildPlaytestExport,
  createFeedbackSubmission,
  summarizeArchive,
  triageFeedback,
  type PlaytestArchive,
} from "./feedback.js";

const snapshot = {
  cheer: 1200,
  totalCheerEarned: 3400,
  cps: 12.5,
  lifetimeClicks: 42,
  prestiges: 0,
  stampsEarned: 2,
  stampIds: ["first_yes", "prompt_master"],
  generatorsOwned: 3,
  upgradesPurchased: 1,
  promptTierUnlocked: 2,
  promptsSeen: 8,
  runPeakCheer: 1200,
};

describe("playtest feedback triage", () => {
  it("marks detailed bug reports with play context as actionable", () => {
    const triage = triageFeedback({
      category: "bug",
      consentToUse: true,
      snapshot,
      message:
        "After I bought the first Auto-Yeser on mobile, Cheer stayed at 15 for 10 seconds. Expected CPS to keep rising after reload.",
    });

    expect(triage.bucket).toBe("actionable");
    expect(triage.score).toBeGreaterThanOrEqual(5);
    expect(triage.flags).toEqual([]);
  });

  it("routes repeated placeholder text to likely noise", () => {
    const triage = triageFeedback({
      category: "other",
      consentToUse: true,
      message: "asdf asdf asdf asdf asdf asdf",
    });

    expect(triage.bucket).toBe("likely_noise");
    expect(triage.flags).toContain("nonsense_pattern");
  });

  it("keeps vague exploit claims out of the actionable bucket", () => {
    const triage = triageFeedback({
      category: "exploit",
      consentToUse: true,
      message: "I can hack infinite cheer with a script lol",
    });

    expect(triage.bucket).not.toBe("actionable");
    expect(triage.flags).toContain("mischief_or_exploit");
  });

  it("allows reproducible exploit reports to become actionable", () => {
    const triage = triageFeedback({
      category: "exploit",
      consentToUse: true,
      snapshot,
      message:
        "After reload, I opened devtools and changed localStorage cheer to 999999. Expected save validation to reset the number before prestige.",
    });

    expect(triage.bucket).toBe("actionable");
    expect(triage.flags).toContain("mischief_or_exploit");
  });

  it("stores bounded submissions and design votes in newest-first order", () => {
    const archive: PlaytestArchive = { submissions: [], votes: [] };

    const first = addFeedbackSubmission(
      archive,
      {
        category: "fun",
        consentToUse: true,
        message: "The first prompt felt fun because it broke up clicking.",
      },
      100,
      () => "feedback-1"
    );
    const vote = addDesignVote(
      archive,
      { decisionId: "prompt_tone", vote: "approve", snapshot },
      200,
      () => "vote-1"
    );

    expect(first.id).toBe("feedback-1");
    expect(vote.id).toBe("vote-1");
    expect(archive.submissions[0]?.id).toBe("feedback-1");
    expect(archive.votes[0]?.id).toBe("vote-1");
  });

  it("exports summary counts with submissions and votes", () => {
    const submission = createFeedbackSubmission(
      {
        category: "confusion",
        consentToUse: true,
        snapshot,
        message:
          "The prestige button was confusing because I was not sure if it would delete stamps after 100000 Cheer.",
      },
      100,
      () => "feedback-1"
    );
    const archive: PlaytestArchive = {
      submissions: [submission],
      votes: [{ id: "vote-1", decisionId: "prestige_decision", vote: "unsure", observedAtMs: 200 }],
    };

    expect(summarizeArchive(archive).actionable).toBe(1);
    const exported = JSON.parse(buildPlaytestExport(archive, 300)) as {
      version: number;
      summary: { actionable: number };
      submissions: unknown[];
      votes: unknown[];
    };
    expect(exported.version).toBe(1);
    expect(exported.summary.actionable).toBe(1);
    expect(exported.submissions).toHaveLength(1);
    expect(exported.votes).toHaveLength(1);
  });
});
