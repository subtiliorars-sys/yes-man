/** Mute-friendly click SFX — Web Audio stub; no asset files shipped. */

const MUTE_KEY = "yes-man-sfx-muted";

export function isSfxMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

let audioCtx: AudioContext | undefined;

function ctx(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return undefined;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

/** Soft warm pop (~80ms). No-op when muted or Web Audio unavailable. */
export function playClickPop(): void {
  if (isSfxMuted()) return;
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") {
    void ac.resume();
  }
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t0);
  osc.frequency.exponentialRampToValueAtTime(280, t0 + 0.06);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.09);
}

/** Warm ascending chime when accepting a prompt bonus. */
export function playPromptYes(): void {
  if (isSfxMuted()) return;
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime;
  [440, 554, 659].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    const start = t0 + i * 0.05;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.1, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  });
}

/** Rising arpeggio (~2s) for prestige — GDD sound direction. */
export function playPrestigeArpeggio(): void {
  if (isSfxMuted()) return;
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime;
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    const start = t0 + i * 0.22;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

const GENERATOR_PITCHES = [392, 440, 494, 523, 587, 659, 698] as const;

/** Gentle chime when passive generators tick — pitch varies by generator type. */
export function playGeneratorTick(generatorIndex: number): void {
  if (isSfxMuted()) return;
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime;
  const freq = GENERATOR_PITCHES[generatorIndex % GENERATOR_PITCHES.length] ?? 440;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.04, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.14);
}
