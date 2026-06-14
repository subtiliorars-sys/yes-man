import Phaser from "phaser";
import { earnedStampCount, refreshStamps, STAMP_DEFS } from "../sim/stamps.js";
import {
  SECRET_COUNT,
  SECRET_DEFS,
  foundSecretCount,
  hasSecret,
} from "../sim/secrets.js";
import type { SimState } from "../sim/types.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#ccccaa";

type Tab = "stamps" | "secrets";

/** Modal collection book: Stamps + Secrets tabs. Tap outside to dismiss. */
export class StampBookPanel extends Phaser.GameObjects.Container {
  private getState: () => SimState;
  private onClose: () => void;
  private tab: Tab = "stamps";
  private contentCells: Phaser.GameObjects.GameObject[] = [];
  private tabBtns: Partial<Record<Tab, Phaser.GameObjects.Text>> = {};

  constructor(
    scene: Phaser.Scene,
    getState: () => SimState,
    onClose: () => void
  ) {
    super(scene, 0, 0);
    this.getState = getState;
    this.onClose = onClose;
    scene.add.existing(this);
    this.setDepth(100);

    const backdrop = scene.add
      .rectangle(240, 400, 480, 800, 0x000000, 0.55)
      .setInteractive({ useHandCursor: false });
    backdrop.on("pointerdown", () => this.dismiss());
    this.add(backdrop);

    const panel = scene.add
      .rectangle(240, 400, 440, 632, 0xfff8dc)
      .setStrokeStyle(2, 0xe8d5b0);
    this.add(panel);

    this.add(
      scene.add
        .text(240, 110, "COLLECTION", {
          fontSize: "18px",
          color: AMBER,
          fontFamily: "system-ui, sans-serif",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );
    const close = scene.add
      .text(436, 110, "✕", { fontSize: "16px", color: INK, fontFamily: "system-ui, sans-serif" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => this.dismiss());
    this.add(close);

    refreshStamps(this.getState());
    this.tabBtns.stamps = this.makeTab(scene, 160, "Stamps", "stamps");
    this.tabBtns.secrets = this.makeTab(scene, 320, "Secrets", "secrets");
    this.rebuildContent();
  }

  private makeTab(
    scene: Phaser.Scene,
    x: number,
    label: string,
    tab: Tab
  ): Phaser.GameObjects.Text {
    const btn = scene.add
      .text(x, 146, label, {
        fontSize: "13px",
        color: INK,
        fontFamily: "system-ui, sans-serif",
        fontStyle: "bold",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      if (this.tab === tab) return;
      this.tab = tab;
      this.rebuildContent();
    });
    this.add(btn);
    return btn;
  }

  private paintTabs(): void {
    (["stamps", "secrets"] as Tab[]).forEach((t) => {
      const btn = this.tabBtns[t];
      if (!btn) return;
      const active = this.tab === t;
      btn.setColor(active ? "#ffffff" : INK);
      btn.setBackgroundColor(active ? AMBER : "#f0e4c8");
    });
  }

  private rebuildContent(): void {
    this.contentCells.forEach((c) => c.destroy());
    this.contentCells = [];
    this.paintTabs();
    if (this.tab === "stamps") this.buildStamps();
    else this.buildSecrets();
  }

  private track(obj: Phaser.GameObjects.GameObject): void {
    this.contentCells.push(obj);
    this.add(obj);
  }

  private buildStamps(): void {
    const state = this.getState();
    const earned = new Set(state.stampsEarned);
    this.track(
      this.scene.add
        .text(240, 178, `${earnedStampCount(state)} / ${STAMP_DEFS.length} stamps earned`, {
          fontSize: "11px",
          color: "#a08060",
          fontFamily: "system-ui, sans-serif",
        })
        .setOrigin(0.5)
    );
    this.grid(STAMP_DEFS.length, (i, x, y) => {
      const def = STAMP_DEFS[i]!;
      const on = earned.has(def.id);
      const cell = this.scene.add
        .text(x, y, `${on ? def.icon : "🔒"}\n${on ? def.label : "???"}`, {
          fontSize: "11px",
          color: on ? INK : MUTED,
          fontFamily: "system-ui, sans-serif",
          align: "center",
        })
        .setOrigin(0.5);
      cell.setAlpha(on ? 1 : 0.5);
      this.track(cell);
    });
  }

  private buildSecrets(): void {
    const state = this.getState();
    this.track(
      this.scene.add
        .text(240, 178, `${foundSecretCount(state)} / ${SECRET_COUNT} secrets found`, {
          fontSize: "11px",
          color: "#a08060",
          fontFamily: "system-ui, sans-serif",
        })
        .setOrigin(0.5)
    );
    this.track(
      this.scene.add
        .text(240, 196, "Tap a found secret to read it again.", {
          fontSize: "9px",
          color: MUTED,
          fontFamily: "system-ui, sans-serif",
          fontStyle: "italic",
        })
        .setOrigin(0.5)
    );
    this.grid(SECRET_DEFS.length, (i, x, y) => {
      const def = SECRET_DEFS[i]!;
      const on = hasSecret(state, def.id);
      const cell = this.scene.add
        .text(x, y, `${on ? def.icon : "❓"}\n${on ? def.label : "???"}`, {
          fontSize: "11px",
          color: on ? INK : MUTED,
          fontFamily: "system-ui, sans-serif",
          align: "center",
        })
        .setOrigin(0.5);
      cell.setAlpha(on ? 1 : 0.5);
      if (on) {
        cell.setInteractive({ useHandCursor: true });
        cell.on("pointerdown", () => this.flashReveal(def.reveal));
      }
      this.track(cell);
    });
  }

  /** 4-column grid laid out from a stable origin; calls back per cell. */
  private grid(
    count: number,
    place: (i: number, x: number, y: number) => void,
    startY = 232
  ): void {
    const cols = 4;
    const cellW = 104;
    const rowH = 62;
    const startX = 240 - (cols * cellW) / 2 + cellW / 2;
    for (let i = 0; i < count; i += 1) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      place(i, startX + col * cellW, startY + row * rowH);
    }
  }

  private flashReveal(text: string): void {
    const t = this.scene.add
      .text(240, 656, text, {
        fontSize: "11px",
        color: AMBER,
        fontFamily: "system-ui, sans-serif",
        fontStyle: "italic",
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5)
      .setDepth(130);
    this.track(t);
    this.scene.tweens.add({
      targets: t,
      alpha: { from: 1, to: 0 },
      delay: 2200,
      duration: 600,
      onComplete: () => t.destroy(),
    });
  }

  dismiss(): void {
    this.onClose();
    this.destroy(true);
  }
}

export function showNewStampToasts(
  scene: Phaser.Scene,
  ids: string[],
  yStart = 130
): void {
  ids.forEach((id, i) => {
    const def = STAMP_DEFS.find((s) => s.id === id);
    if (!def) return;
    const t = scene.add.text(240, yStart + i * 22, `Stamp: ${def.icon} ${def.label}`, {
      fontSize: "12px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(90);
    scene.tweens.add({
      targets: t,
      y: yStart + i * 22 - 30,
      alpha: 0,
      duration: 1800,
      delay: i * 200,
      onComplete: () => t.destroy(),
    });
  });
}
