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

/** Tier 2 — unlock at total Cheer earned (GDD content plan). */
export const PROMPT_TIER2_THRESHOLD = 5_000;
export const PROMPT_TIER3_THRESHOLD = 25_000;
export const PROMPT_TIER4_THRESHOLD = 100_000;
export const PROMPT_TIER5_THRESHOLD = 500_000;
export const PROMPT_TIER6_THRESHOLD = 2_000_000;

export const PROMPTS_TIER2: readonly PromptDef[] = [
  { text: "Join a flash mob in the grocery store?", bonus: 60, flavor: "You only know half the dance. You commit anyway." },
  { text: "Buy the absurdly specific kitchen gadget from the ad?", bonus: 45, flavor: "You will use it twice. It was worth it both times." },
  { text: "Say yes to pet-sitting a hedgehog for the weekend?", bonus: 55, flavor: "It is prickly and judgmental. You love it." },
  { text: "Attend a coworker's improv show on a weeknight?", bonus: 40, flavor: "Someone says 'yes, and…' unironically. You clap hard." },
  { text: "Try the spicy challenge menu item?", bonus: 35, flavor: "Your tongue files a complaint. You sign the waiver." },
  { text: "Help assemble IKEA furniture with no instructions?", bonus: 70, flavor: "Three extra screws remain. That is tradition." },
  { text: "Volunteer to taste-test experimental ice cream flavors?", bonus: 50, flavor: "One is 'confident pickle.' You finish the cup." },
  { text: "Go to a silent disco anyway?", bonus: 45, flavor: "You are dancing to different songs. Everyone is happy." },
  { text: "Take the free sample from the enthusiastic kiosk?", bonus: 25, flavor: "You now own a tiny spoon and a new newsletter." },
  { text: "Sign up for the 5K you did not train for?", bonus: 80, flavor: "You walk briskly with dignity. Still counts." },
];

/** Tier 3 — unlock at 25K total Cheer (GDD: genuinely weird). */
export const PROMPTS_TIER3: readonly PromptDef[] = [
  { text: "Trade names with a barista for the rest of the day?", bonus: 90, flavor: "They call you Espresso. You call them Kevin. It works." },
  { text: "Wear a cape to the grocery store 'for confidence'?", bonus: 75, flavor: "Three strangers salute you. One asks for autographs." },
  { text: "Say yes to hosting a séance-themed book club?", bonus: 85, flavor: "The candles were scented 'library ghost.' Everyone loved it." },
  { text: "Help a stranger parallel park using only hand signals?", bonus: 70, flavor: "It takes four tries. You both cheer at the end." },
  { text: "Join a neighborhood committee about bird bath etiquette?", bonus: 65, flavor: "There is a spreadsheet. You are now Vice Chair." },
  { text: "Audition for a local commercial as 'Happy Customer #3'?", bonus: 95, flavor: "You nail the line: 'I also enjoy beverages!'" },
  { text: "Babysit a friend's sourdough starter for a week?", bonus: 80, flavor: "You name it Gerald. Gerald is thriving." },
  { text: "Take the scenic elevator instead of the stairs?", bonus: 60, flavor: "A stranger shares life advice between floors 2 and 3." },
  { text: "Participate in a workplace 'fun fact' icebreaker?", bonus: 55, flavor: "Your fact is too good. HR asks for a follow-up email." },
  { text: "Say yes to a mystery box from the community swap?", bonus: 100, flavor: "Inside: a ukulele, three scarves, and a note that says 'you'll know.'" },
];

/** Tier 4 — unlock at 100K total Cheer (GDD: heartfelt / meaningful). */
export const PROMPTS_TIER4: readonly PromptDef[] = [
  { text: "Call someone you have been meaning to reconnect with?", bonus: 120, flavor: "They answer on the second ring. It feels like no time passed." },
  { text: "Apologize for something small you still think about?", bonus: 110, flavor: "They laugh. 'I forgot that even happened.' You feel lighter." },
  { text: "Say yes to helping a neighbor who never asks for help?", bonus: 130, flavor: "They cry a little. You pretend you did not notice. It is okay." },
  { text: "Write a thank-you note to a teacher who changed your path?", bonus: 115, flavor: "They reply: 'I still remember you.' You definitely cry." },
  { text: "Attend a memorial for someone you barely knew?", bonus: 125, flavor: "You learn three stories that make you glad you came." },
  { text: "Offer to cover a shift so a coworker can be with family?", bonus: 140, flavor: "They send a photo later. Worth every minute." },
  { text: "Say yes to a hard conversation you have been avoiding?", bonus: 150, flavor: "It is awkward for four minutes. Then it is better." },
  { text: "Donate time to a cause you care about but never made time for?", bonus: 135, flavor: "You meet someone who says the same thing about you." },
  { text: "Tell a friend you are proud of them, out loud?", bonus: 105, flavor: "They go quiet, then: 'That means a lot.' So do you." },
  { text: "Take a day to rest without calling it lazy?", bonus: 160, flavor: "You wake up softer. Progress, not perfection." },
];

/** Tier 5 — unlock at 500K total Cheer (GDD: cosmic / philosophical). */
export const PROMPTS_TIER5: readonly PromptDef[] = [
  { text: "Watch the sunrise even though you are not a morning person?", bonus: 175, flavor: "The sky does not ask permission. Neither do you." },
  { text: "Say yes to sitting quietly for ten minutes with no phone?", bonus: 150, flavor: "Your thoughts arrive like polite guests." },
  { text: "Forgive yourself for a choice you made years ago?", bonus: 200, flavor: "You were doing your best with what you knew." },
  { text: "Walk outside and name three things you are grateful for?", bonus: 165, flavor: "One of them is embarrassingly small. It counts." },
  { text: "Accept that some questions do not need answers today?", bonus: 180, flavor: "The universe nods. You exhale." },
  { text: "Plant something knowing you may not see it fully grown?", bonus: 190, flavor: "Future you will thank present you. Maybe literally." },
  { text: "Listen to a song that makes you feel like a kid again?", bonus: 155, flavor: "You remember the chorus. Your shoulders drop." },
  { text: "Say yes to being imperfect in public?", bonus: 170, flavor: "Someone else relaxes because you did." },
  { text: "Watch clouds until you forget what you were worried about?", bonus: 160, flavor: "They reshape themselves. So can you." },
  { text: "Trust that saying yes to small joys adds up?", bonus: 210, flavor: "The math is kindness, not arithmetic." },
];

/** Tier 6 — unlock at 2M total Cheer (GDD: fourth-wall / full absurdity). */
export const PROMPTS_TIER6: readonly PromptDef[] = [
  { text: "Click the big YES button one more time?", bonus: 220, flavor: "Meta? Maybe. Fun? Definitely." },
  { text: "Open the stamp book to admire your collection?", bonus: 180, flavor: "Achievement unlocked: appreciating achievements." },
  { text: "Toggle sound off, then on, just to hear the pop?", bonus: 150, flavor: "The dev who wrote this smiles somewhere." },
  { text: "Export playtest feedback about how weird tier 6 is?", bonus: 250, flavor: "Consent-based telemetry: you hold the clipboard." },
  { text: "Prestige even though the numbers are comforting?", bonus: 300, flavor: "Fresh outlook loading… ████████░░ 80%" },
  { text: "Buy the seventh generator because the domino row looks lonely?", bonus: 240, flavor: "Cosmic Yes appreciates the aesthetic." },
  { text: "Read every flavor line on every Auto-Yeser?", bonus: 190, flavor: "The Elder has seen things. So have you." },
  { text: "Say yes to recommending this game to one friend?", bonus: 275, flavor: "No dark patterns attached. Pinky promise." },
  { text: "Leave the tab open to earn offline Cheer ethically?", bonus: 200, flavor: "Full progress. No FOMO timer. GDD P2." },
  { text: "Start a new run after you have seen every prompt?", bonus: 350, flavor: "Completionist energy is valid completionist energy." },
];

export const PRESTIGE_THRESHOLD = 100_000;
export const PRESTIGE_THRESHOLD_GROWTH = 1.5;
export const MAX_PRESTIGES = 20;
export const GEN_COST_GROWTH = 1.15;
export const SYNERGY_UPGRADE_INDEX = 5;
export const CASCADE_UPGRADE_INDEX = 6;
export const PROMPT_CLICKS_MIN = 5;
export const PROMPT_CLICKS_MAX = 15;

/**
 * Golden Yes — a warm surprise bubble that drifts across the screen.
 * Tapping it grants a burst of Cheer. Never punishing, never timed-FOMO:
 * if you miss one, another comes along. (GDD: honest delight, no dark patterns.)
 */
export const GOLDEN_MIN_SECONDS = 75;
export const GOLDEN_MAX_SECONDS = 165;
/** Seconds the bubble lingers on screen before drifting away. */
export const GOLDEN_LIFETIME_SECONDS = 11;
/** Reward = max(this many seconds of current CPS, this multiple of a click). */
export const GOLDEN_CPS_SECONDS = 60;
export const GOLDEN_CLICK_MULTIPLE = 40;

export const YES_VARIANTS = [
  "YES", "Yes!", "Hell yes", "Sure why not", "Count me in", "Let's do it",
  "Absolutely", "Why the hell not", "OK", "Let's go!", "In!", "Yep!",
  "Affirmative", "Totally", "Why not", "Do it", "Sign me up",
] as const;
