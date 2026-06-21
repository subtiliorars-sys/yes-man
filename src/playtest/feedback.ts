import type { SimState } from "../sim/types.js";
import { promptTierUnlocked } from "../sim/engine.js";

export const PLAYTEST_STORAGE_KEY = "yesman_playtest_feedback_v1";

export type FeedbackCategory =
  | "bug"
  | "balance"
  | "confusion"
  | "fun"
  | "exploit"
  | "accessibility"
  | "other";

export type TriageBucket = "actionable" | "needs_review" | "likely_noise";

export interface PlaytestSnapshot {
  cheer: number;
  totalCheerEarned: number;
  cps: number;
  lifetimeClicks: number;
  prestiges: number;
  stampsEarned: number;
  generatorsOwned: number;
  upgradesPurchased: number;
  promptTierUnlocked: number;
  promptsSeen: number;
}

export interface FeedbackInput {
  message: string;
  category: FeedbackCategory;
  testerAlias?: string;
  consentToUse: boolean;
  observedAtMs?: number;
  snapshot?: PlaytestSnapshot;
}

export interface FeedbackTriage {
  bucket: TriageBucket;
  score: number;
  flags: string[];
  reasons: string[];
}

export interface PlaytestSubmission extends FeedbackInput {
  id: string;
  normalizedMessage: string;
  observedAtMs: number;
  triage: FeedbackTriage;
}

export type DesignVoteValue = "approve" | "reject" | "unsure";

export interface DesignDecision {
  id: string;
  title: string;
  prompt: string;
}

export interface DesignVote {
  id: string;
  decisionId: string;
  vote: DesignVoteValue;
  note?: string;
  testerAlias?: string;
  observedAtMs: number;
  snapshot?: PlaytestSnapshot;
}

export interface PlaytestArchive {
  submissions: PlaytestSubmission[];
  votes: DesignVote[];
}

export const DESIGN_DECISIONS: readonly DesignDecision[] = [
  {
    id: "first_minute_pace",
    title: "First-minute pace",
    prompt: "Does the first minute reach a fun rhythm quickly enough?",
  },
  {
    id: "prompt_tone",
    title: "Prompt tone",
    prompt: "Do the prompt jokes feel charming without becoming mean?",
  },
  {
    id: "domino_shop_clarity",
    title: "Auto-Yeser clarity",
    prompt: "Is it clear what the domino Auto-Yesers do and when to buy them?",
  },
  {
    id: "prestige_decision",
    title: "Prestige decision",
    prompt: "Does A Fresh Outlook feel understandable and optional?",
  },
  {
    id: "keyboard_yes",
    title: "Keyboard YES",
    prompt: "Did Space/Enter to click feel natural on desktop?",
  },
];

const REPRO_TERMS = [
  "after",
  "before",
  "bought",
  "browser",
  "cheer",
  "clicked",
  "console",
  "cps",
  "desktop",
  "expected",
  "got",
  "mobile",
  "offline",
  "prestige",
  "reload",
  "save",
  "steps",
  "stamps",
  "upgrade",
  "when",
];

const DESIGN_TERMS = [
  "annoying",
  "because",
  "boring",
  "clear",
  "confusing",
  "felt",
  "fun",
  "prefer",
  "rewarding",
  "should",
  "slow",
  "suggest",
  "too fast",
  "too slow",
  "would",
];

const MISCHIEF_TERMS = [
  "autoclick",
  "bot",
  "break",
  "cheat",
  "devtools",
  "dupe",
  "exploit",
  "hack",
  "infinite",
  "localstorage",
  "script",
  "spam",
];

const NONSENSE_TERMS = ["asdf", "blah", "fjfj", "gibberish", "lorem ipsum"];

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, " ").trim();
}

function countMatches(message: string, terms: readonly string[]): number {
  const lower = message.toLowerCase();
  return terms.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);
}

function hasRepeatedNoise(message: string): boolean {
  const lower = message.toLowerCase();
  if (/(.)\1{5,}/.test(lower)) return true;

  const words = lower.match(/[a-z0-9]+/g) ?? [];
  if (words.length < 6) return false;

  const uniqueWords = new Set(words);
  return uniqueWords.size <= 2;
}

export function snapshotFromState(state: SimState, cps: number): PlaytestSnapshot {
  return {
    cheer: Math.round(state.cheer),
    totalCheerEarned: Math.round(state.totalCheerEarned),
    cps: Math.round(cps * 100) / 100,
    lifetimeClicks: state.lifetimeClicks,
    prestiges: state.prestiges,
    stampsEarned: state.stampsEarned.length,
    generatorsOwned: state.genOwned.reduce((sum, n) => sum + n, 0),
    upgradesPurchased: state.upgPurchased.filter(Boolean).length,
    promptTierUnlocked: promptTierUnlocked(state.totalCheerEarned),
    promptsSeen: state.nextPromptIndex,
  };
}

export function triageFeedback(input: FeedbackInput): FeedbackTriage {
  const message = normalizeMessage(input.message);
  const flags: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  if (!input.consentToUse) {
    flags.push("no_consent");
    reasons.push("tester did not opt in to use feedback");
    score -= 2;
  }

  if (message.length < 12) {
    flags.push("too_short");
    reasons.push("message is too short to interpret");
    score -= 4;
  } else if (message.length >= 35) {
    score += 2;
    reasons.push("message has enough detail to evaluate");
  }

  if (message.length >= 90) {
    score += 1;
    reasons.push("message includes extended detail");
  }

  if (hasRepeatedNoise(message) || countMatches(message, NONSENSE_TERMS) > 0) {
    flags.push("nonsense_pattern");
    reasons.push("message resembles repeated or placeholder text");
    score -= 5;
  }

  if (input.category !== "other") {
    score += 1;
    reasons.push(`tester chose ${input.category} category`);
  }

  const reproSignals = countMatches(message, REPRO_TERMS);
  if (reproSignals > 0) {
    score += Math.min(3, reproSignals);
    reasons.push("message includes reproduction or context clues");
  }

  const designSignals = countMatches(message, DESIGN_TERMS);
  if (designSignals > 0) {
    score += Math.min(2, designSignals);
    reasons.push("message explains player experience or design preference");
  }

  if (/\d/.test(message)) {
    score += 1;
    reasons.push("message includes a number that may anchor the report");
  }

  if ((input.snapshot?.lifetimeClicks ?? 0) > 0) {
    score += 1;
    reasons.push("feedback is attached to an actual play session snapshot");
  }

  const mischiefSignals = countMatches(message, MISCHIEF_TERMS);
  if (mischiefSignals > 0 || input.category === "exploit") {
    flags.push("mischief_or_exploit");
    reasons.push("message mentions exploit, cheating, automation, or breakage");
    score += input.category === "bug" || input.category === "exploit" ? 1 : 0;
    if (reproSignals < 2) score -= 2;
  }

  let bucket: TriageBucket = "needs_review";
  if (score >= 5) bucket = "actionable";
  if (score <= 0) bucket = "likely_noise";
  if (flags.includes("no_consent") && bucket === "actionable") {
    bucket = "needs_review";
  }

  return { bucket, score, flags, reasons };
}

export function createFeedbackSubmission(
  input: FeedbackInput,
  nowMs: number = Date.now(),
  idFactory: () => string = defaultId
): PlaytestSubmission {
  const normalizedMessage = normalizeMessage(input.message);
  const observedAtMs = input.observedAtMs ?? nowMs;
  const normalizedInput = { ...input, message: normalizedMessage, observedAtMs };
  return {
    ...normalizedInput,
    id: idFactory(),
    normalizedMessage,
    triage: triageFeedback(normalizedInput),
  };
}

export function loadPlaytestArchive(
  storage?: Pick<Storage, "getItem">
): PlaytestArchive {
  if (!storage) return emptyArchive();
  try {
    const raw = storage.getItem(PLAYTEST_STORAGE_KEY);
    if (!raw) return emptyArchive();
    const parsed = JSON.parse(raw) as Partial<PlaytestArchive>;
    return {
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
    };
  } catch {
    return emptyArchive();
  }
}

export function savePlaytestArchive(
  archive: PlaytestArchive,
  storage?: Pick<Storage, "setItem">
): void {
  if (!storage) return;
  try {
    storage.setItem(PLAYTEST_STORAGE_KEY, JSON.stringify(archive));
  } catch {
    /* quota / private mode - feedback export still works from memory */
  }
}

export function addFeedbackSubmission(
  archive: PlaytestArchive,
  input: FeedbackInput,
  nowMs: number = Date.now(),
  idFactory: () => string = defaultId
): PlaytestSubmission {
  const submission = createFeedbackSubmission(input, nowMs, idFactory);
  archive.submissions = [submission, ...archive.submissions].slice(0, 200);
  return submission;
}

export function addDesignVote(
  archive: PlaytestArchive,
  vote: Omit<DesignVote, "id" | "observedAtMs"> & { observedAtMs?: number },
  nowMs: number = Date.now(),
  idFactory: () => string = defaultId
): DesignVote {
  const storedVote: DesignVote = {
    ...vote,
    id: idFactory(),
    observedAtMs: vote.observedAtMs ?? nowMs,
  };
  archive.votes = [storedVote, ...archive.votes].slice(0, 400);
  return storedVote;
}

export function summarizeArchive(archive: PlaytestArchive): Record<TriageBucket, number> {
  return archive.submissions.reduce<Record<TriageBucket, number>>(
    (counts, submission) => {
      counts[submission.triage.bucket] += 1;
      return counts;
    },
    { actionable: 0, needs_review: 0, likely_noise: 0 }
  );
}

export function buildPlaytestExport(
  archive: PlaytestArchive,
  exportedAtMs: number = Date.now()
): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAtMs,
      summary: summarizeArchive(archive),
      submissions: archive.submissions,
      votes: archive.votes,
    },
    null,
    2
  );
}

function emptyArchive(): PlaytestArchive {
  return { submissions: [], votes: [] };
}

function defaultId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && "randomUUID" in cryptoApi) {
    return cryptoApi.randomUUID();
  }
  return `pt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
