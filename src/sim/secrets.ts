import type { SimState } from "./types.js";

/**
 * Easter eggs — hidden, never-required delights for players who fall in love
 * with Yes Man and want to collect everything. Discovery is permanent and
 * survives prestige. Nothing here gates progress; it is pure joy.
 *
 * Each secret carries a private `hint` shown only once it is found, and a
 * `reveal` line — the wink the game gives back. Undiscovered secrets render as
 * "???" in the book so the count is visible but the surprise is preserved.
 */
export interface SecretDef {
  id: string;
  /** Shown in the book once discovered. */
  label: string;
  icon: string;
  /** The warm one-liner the game says when you find it. */
  reveal: string;
}

export const SECRET_DEFS: readonly SecretDef[] = [
  {
    id: "konami",
    label: "The Old Code",
    icon: "🎮",
    reveal: "↑↑↓↓←→←→ B A — some yeses are eternal.",
  },
  {
    id: "title_tapper",
    label: "Sign Spinner",
    icon: "🪧",
    reveal: "You tapped the sign until it tapped back. Hi there.",
  },
  {
    id: "good_dog",
    label: "Good Dog",
    icon: "🦴",
    reveal: "The Enthusiastic Dog has been a very good dog. Yes. YES.",
  },
  {
    id: "night_owl",
    label: "Night Owl",
    icon: "🦉",
    reveal: "Up late saying yes to one more click. We see you.",
  },
  {
    id: "long_haul",
    label: "Long Haul",
    icon: "🧳",
    reveal: "You came back after a long time away. The lights were left on for you.",
  },
  {
    id: "lucky_sevens",
    label: "Lucky Sevens",
    icon: "🍀",
    reveal: "777 yeses and counting. The universe says yes right back.",
  },
  {
    id: "the_answer",
    label: "The Answer",
    icon: "🐬",
    reveal: "42 generators of pure enthusiasm. So long, and thanks.",
  },
  {
    id: "philosopher",
    label: "The Pragmatist",
    icon: "📖",
    reveal: "William James smiles: the truth of \"yes\" is in what it does.",
  },
  {
    id: "mute_zen",
    label: "Quiet Yes",
    icon: "🤫",
    reveal: "A yes can be silent and still mean everything.",
  },
  {
    id: "completionist",
    label: "Every Yes",
    icon: "🏆",
    reveal: "Every stamp, every secret. You said yes to all of it.",
  },
];

export const SECRET_COUNT = SECRET_DEFS.length;

export function secretById(id: string): SecretDef | undefined {
  return SECRET_DEFS.find((s) => s.id === id);
}

export function hasSecret(state: SimState, id: string): boolean {
  return state.secretsFound.includes(id);
}

export function foundSecretCount(state: SimState): number {
  // Guard against stray ids from older/hand-edited saves.
  const valid = new Set(SECRET_DEFS.map((s) => s.id));
  return state.secretsFound.filter((id) => valid.has(id)).length;
}

/**
 * Record a secret as discovered. Idempotent — returns the def only the first
 * time so the UI can celebrate exactly once. Unknown ids are ignored.
 */
export function discoverSecret(state: SimState, id: string): SecretDef | null {
  const def = secretById(id);
  if (!def) return null;
  if (state.secretsFound.includes(id)) return null;
  state.secretsFound = [...state.secretsFound, id];
  return def;
}

/** Context the scene knows about that the pure state does not. */
export interface PassiveSecretContext {
  /** Local hour 0–23 at the moment of the check. */
  localHour: number;
  /** Seconds the player was away since last save (one-shot, on load). */
  offlineSeconds: number;
}

/**
 * Discover every secret whose condition is implied by the current state +
 * context. Returns the freshly-found defs so the scene can celebrate them.
 * Pure and idempotent — safe to call every frame.
 */
export function evaluatePassiveSecrets(
  state: SimState,
  ctx: PassiveSecretContext
): SecretDef[] {
  const fresh: SecretDef[] = [];
  const tryFind = (id: string, condition: boolean): void => {
    if (!condition) return;
    const def = discoverSecret(state, id);
    if (def) fresh.push(def);
  };

  const totalGens = state.genOwned.reduce((sum, n) => sum + n, 0);
  tryFind("lucky_sevens", state.lifetimeClicks >= 777);
  tryFind("the_answer", totalGens >= 42);
  tryFind("good_dog", (state.genOwned[0] ?? 0) >= 25);
  tryFind("night_owl", ctx.localHour >= 0 && ctx.localHour < 5);
  tryFind("long_haul", ctx.offlineSeconds >= 24 * 3_600);

  return fresh;
}
