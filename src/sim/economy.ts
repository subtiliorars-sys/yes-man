import type { GeneratorDef, PromptDef, UpgradeDef } from "./types.js";

/** Generator catalog — ported from yes-man-prototype.html (TUNABLE). */
export const GENERATOR_DEFS: readonly GeneratorDef[] = [
  { id: "dog", name: "Enthusiastic Dog", baseCost: 15, baseCps: 1,
    flavor: '"YES to walks! YES to treats! YES to that squirrel!"' },
  { id: "friend", name: "Supportive Friend", baseCost: 50, baseCps: 4,
    flavor: '"You wanna quit your job and become a mime? I support you."' },
  { id: "robot", name: "Automated Optimist", baseCost: 150, baseCps: 12,
    flavor: '"AFFIRMATIVE. CONTINUE BEING AWESOME."' },
  { id: "bot3000", name: "Yes-Bot 3000", baseCost: 500, baseCps: 35,
    flavor: '"I have calculated all outcomes. Saying yes is optimal in 94%."' },
  { id: "elder", name: "The Elder", baseCost: 1500, baseCps: 100,
    flavor: '"I said yes to the Depression. We got ice cream. We are fine now."' },
  { id: "reckless", name: "Reckless Friend", baseCost: 5000, baseCps: 300,
    flavor: '"Helicopter lesson? The instructor was NOT ready."' },
  { id: "cosmic", name: "Cosmic Yes", baseCost: 15000, baseCps: 800,
    flavor: '"The cosmos agreed to exist. Small stuff? Easy yes."' },
];

/** Upgrade catalog — apply effects live in engine.ts (TUNABLE). */
export const UPGRADE_DEFS: readonly UpgradeDef[] = [
  { id: "stronger", name: "Stronger Yes", cost: 100, desc: "Click value x2" },
  { id: "enthusiasm", name: "Enthusiasm", cost: 500, desc: "All generators x1.5" },
  { id: "louder", name: "Louder Yes", cost: 1000, desc: "Click value x3" },
  { id: "momentum", name: "Momentum", cost: 3000, desc: "All generators x2" },
  { id: "boundless", name: "Boundless Energy", cost: 8000, desc: "Click value x5" },
  { id: "synergy", name: "Synergy", cost: 15000, desc: "+10% CPS per owned generator type" },
  { id: "cascade", name: "Yes Cascade", cost: 40000, desc: "5% chance for 10 free clicks" },
  { id: "overflowing", name: "Overflowing Yes", cost: 100000, desc: "Click value x10" },
];

export const PROMPTS: readonly PromptDef[] = [
  { text: 'Friend asks: "Can you help me move this couch?"', bonus: 50, flavor: "Your back will remember this." },
  { text: "Coworker wants you to try their homemade kombucha.", bonus: 20, flavor: "It is… fermented. You are very polite about it." },
  { text: "Go for a walk even though it is drizzling?", bonus: 35, flavor: "The rain is actually nice once you are in it." },
  { text: "Someone needs a ride to the airport at 5 AM.", bonus: 40, flavor: "You both bond over how terrible this is." },
  { text: "Try that weird new restaurant that just opened?", bonus: 25, flavor: "It is surprisingly good. Or maybe you are just hungry." },
  { text: "Pet a stranger's dog without asking? They look friendly.", bonus: 15, flavor: "The dog approves. The owner smiles." },
  { text: "Stay up late watching one more episode?", bonus: 20, flavor: "Worth it. Tomorrow you will disagree." },
  { text: "Volunteer for the office trivia team?", bonus: 45, flavor: "You know exactly one thing. It comes up." },
  { text: "Adopt a plant from the farmers market?", bonus: 30, flavor: "You name it something embarrassing." },
  { text: "Take the scenic route home?", bonus: 25, flavor: "You see a beautiful sunset you would have missed." },
  { text: "Say hi to the neighbor you always avoid?", bonus: 35, flavor: "They are actually lovely. They also avoid you." },
  { text: "Go to a yoga class even though you are inflexible?", bonus: 40, flavor: "You fall over twice. So does everyone else." },
  { text: "Try cooking a complicated recipe from scratch?", bonus: 30, flavor: "It is edible. You call it a win." },
  { text: "Join a random Discord server for a niche hobby?", bonus: 20, flavor: "You find your people." },
  { text: "Reply to that email you have been avoiding for weeks?", bonus: 50, flavor: "They reply in 3 minutes. It is fine." },
];

export const PRESTIGE_THRESHOLD = 100_000;
export const PRESTIGE_THRESHOLD_GROWTH = 1.5;
export const MAX_PRESTIGES = 20;
export const GEN_COST_GROWTH = 1.15;
export const SYNERGY_UPGRADE_INDEX = 5;
export const CASCADE_UPGRADE_INDEX = 6;
export const PROMPT_CLICKS_MIN = 5;
export const PROMPT_CLICKS_MAX = 15;

export const YES_VARIANTS = [
  "YES", "Yes!", "Hell yes", "Sure why not", "Count me in", "Let's do it",
  "Absolutely", "Why the hell not", "OK", "Let's go!", "In!", "Yep!",
  "Affirmative", "Totally", "Why not", "Do it", "Sign me up",
] as const;
