import Phaser from "phaser";
import { createState, formatCheer, formatDuration, totalCps } from "../sim/engine.js";
import { exportSave, importSave } from "../sim/persistence.js";
import { isSfxMuted, setSfxMuted } from "../audio/sfx.js";
import { isReduceMotion, setReduceMotion } from "../sim/prefs.js";
import { STAMP_DEFS, earnedStampCount } from "../sim/stamps.js";
import { SECRET_COUNT, foundSecretCount } from "../sim/secrets.js";
import type { SimState } from "../sim/types.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#a08060";
const DANGER = "#c0563f";

export interface SettingsCallbacks {
  onClose: () => void;
  /** Persist + refresh after an in-place change (toggles). */
  onChange: () => void;
  /** Swap the live game state (import / reset). */
  onReplaceState: (state: SimState) => void;
  /** Discover an Easter egg by id. */
  onSecret: (id: string) => void;
}

/** Settings + Journey stats + data management — modal, tap outside to close. */
export class SettingsPanel extends Phaser.GameObjects.Container {
  private cb: SettingsCallbacks;
  private getState: () => SimState;

  constructor(
    scene: Phaser.Scene,
    getState: () => SimState,
    callbacks: SettingsCallbacks
  ) {
    super(scene, 0, 0);
    this.cb = callbacks;
    this.getState = getState;
    scene.add.existing(this);
    this.setDepth(120);

    const backdrop = scene.add
      .rectangle(240, 400, 480, 800, 0x000000, 0.55)
      .setInteractive({ useHandCursor: false });
    backdrop.on("pointerdown", () => this.dismiss());
    this.add(backdrop);

    const panel = scene.add
      .rectangle(240, 400, 440, 624, 0xfff8dc)
      .setStrokeStyle(2, 0xe8d5b0);
    this.add(panel);

    this.add(
      scene.add
        .text(240, 112, "SETTINGS", {
          fontSize: "18px",
          color: AMBER,
          fontFamily: "system-ui, sans-serif",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );
    const close = scene.add
      .text(436, 112, "✕", { fontSize: "16px", color: INK, fontFamily: "system-ui, sans-serif" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => this.dismiss());
    this.add(close);

    this.buildToggles(scene);
    this.buildStats(scene);
    this.buildData(scene);
    this.buildAbout(scene);
  }

  private buildToggles(scene: Phaser.Scene): void {
    const sound = this.makeToggleRow(scene, 150, "Sound", () => !isSfxMuted(), () => {
      const nowMuted = !isSfxMuted();
      setSfxMuted(nowMuted);
      if (nowMuted) this.cb.onSecret("mute_zen");
      this.cb.onChange();
    });
    const motion = this.makeToggleRow(scene, 184, "Reduce motion", () => isReduceMotion(), () => {
      setReduceMotion(!isReduceMotion());
      this.cb.onChange();
    });
    this.add([sound, motion]);
    this.add(
      scene.add
        .text(48, 206, "Calmer visuals — fewer particles and tweens when on.", {
          fontSize: "9px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
        })
        .setOrigin(0, 0.5)
    );
  }

  /** A "Label …… [On/Off]" row whose button reflects + flips a boolean. */
  private makeToggleRow(
    scene: Phaser.Scene,
    y: number,
    label: string,
    isOn: () => boolean,
    toggle: () => void
  ): Phaser.GameObjects.Container {
    const row = scene.add.container(0, 0);
    row.add(
      scene.add
        .text(48, y, label, { fontSize: "13px", color: INK, fontFamily: "system-ui, sans-serif" })
        .setOrigin(0, 0.5)
    );
    const btn = scene.add
      .text(432, y, "", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontStyle: "bold",
        backgroundColor: AMBER,
        padding: { x: 10, y: 4 },
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });
    const paint = (): void => {
      const on = isOn();
      btn.setText(on ? "On" : "Off");
      btn.setBackgroundColor(on ? AMBER : "#bbb39a");
    };
    paint();
    btn.on("pointerdown", () => {
      toggle();
      paint();
    });
    row.add(btn);
    return row;
  }

  private buildStats(scene: Phaser.Scene): void {
    const s = this.getState();
    this.add(
      scene.add
        .text(48, 232, "YOUR JOURNEY", {
          fontSize: "11px",
          color: MUTED,
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
    );
    const lines = [
      ["Time saying yes", formatDuration(s.playSeconds)],
      ["Lifetime yeses", Math.floor(s.lifetimeClicks).toLocaleString()],
      ["Cheer Cascades", Math.floor(s.lifetimeCascades).toLocaleString()],
      ["Golden Yeses", Math.floor(s.lifetimeGoldenYes).toLocaleString()],
      ["Total Cheer earned", formatCheer(s.totalCheerEarned)],
      ["Cheer per second", `${formatCheer(totalCps(s))}/s`],
      ["Fresh Outlooks", `${s.prestiges} (×${s.prestigeMultiplier.toFixed(2)})`],
      ["Stamps collected", `${earnedStampCount(s)} / ${STAMP_DEFS.length}`],
      ["Secrets found", `${foundSecretCount(s)} / ${SECRET_COUNT}`],
    ] as const;
    let y = 256;
    for (const [label, value] of lines) {
      this.add(
        scene.add.text(48, y, label, {
          fontSize: "12px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
        }).setOrigin(0, 0.5)
      );
      this.add(
        scene.add.text(432, y, value, {
          fontSize: "12px",
          color: INK,
          fontFamily: "system-ui, sans-serif",
          fontStyle: "bold",
        }).setOrigin(1, 0.5)
      );
      y += 22;
    }
  }

  private buildData(scene: Phaser.Scene): void {
    this.add(
      scene.add
        .text(48, 460, "YOUR DATA", {
          fontSize: "11px",
          color: MUTED,
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
    );
    const exportBtn = this.makeButton(scene, 110, 488, "Export", AMBER, () => this.doExport());
    const importBtn = this.makeButton(scene, 240, 488, "Import", "#5f9ea0", () => this.doImport());
    const resetBtn = this.makeButton(scene, 372, 488, "Start Over", DANGER, () => this.doReset());
    this.add([exportBtn, importBtn, resetBtn]);
    this.add(
      scene.add
        .text(240, 516, "Export copies a backup code. Nothing is ever sent online.", {
          fontSize: "9px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
          align: "center",
        })
        .setOrigin(0.5)
    );
  }

  private buildAbout(scene: Phaser.Scene): void {
    this.add(
      scene.add
        .text(48, 552, "ABOUT", {
          fontSize: "11px",
          color: MUTED,
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
    );
    this.add(
      scene.add
        .text(240, 582, "Yes Man v1.0 — a feel-good idle game.\nNo timers. No FOMO. Full offline progress.", {
          fontSize: "11px",
          color: INK,
          fontFamily: "system-ui, sans-serif",
          align: "center",
        })
        .setOrigin(0.5)
    );
    const why = scene.add
      .text(240, 624, "Why “yes”? →", {
        fontSize: "11px",
        color: AMBER,
        fontFamily: "system-ui, sans-serif",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    why.on("pointerdown", () => {
      this.cb.onSecret("philosopher");
      why.setText("“The truth of an idea is what it does.” — W. James");
      why.disableInteractive();
    });
    this.add(why);
    this.add(
      scene.add
        .text(240, 678, "Made with love. Yes to you. 💛", {
          fontSize: "10px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
        })
        .setOrigin(0.5)
    );
  }

  private makeButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    color: string,
    onTap: () => void
  ): Phaser.GameObjects.Text {
    const btn = scene.add
      .text(x, y, label, {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        fontStyle: "bold",
        backgroundColor: color,
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", onTap);
    return btn;
  }

  private doExport(): void {
    const code = exportSave(this.getState());
    const w = typeof window !== "undefined" ? window : undefined;
    const clip = w?.navigator?.clipboard?.writeText?.(code);
    if (clip) void clip.catch(() => undefined);
    w?.prompt?.("Your Yes Man backup code (copy it somewhere safe):", code);
  }

  private doImport(): void {
    const w = typeof window !== "undefined" ? window : undefined;
    const text = w?.prompt?.("Paste a Yes Man backup code:");
    if (!text) return;
    const restored = importSave(text);
    if (!restored) {
      w?.alert?.("That code could not be read. Your current game is untouched.");
      return;
    }
    this.cb.onReplaceState(restored);
    this.dismiss();
  }

  private doReset(): void {
    const w = typeof window !== "undefined" ? window : undefined;
    const ok = w?.confirm?.(
      "Start over? This clears your Yes journey on this device — stamps and secrets included. Consider exporting a backup first."
    );
    if (!ok) return;
    this.cb.onReplaceState(createState());
    this.dismiss();
  }

  dismiss(): void {
    this.cb.onClose();
    this.destroy(true);
  }
}
