import Phaser from "phaser";
import { earnedStampCount, refreshStamps, STAMP_DEFS } from "../sim/stamps.js";
import type { SimState } from "../sim/types.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#ccccaa";

/** Modal stamp grid — tap outside or close to dismiss. */
export class StampBookPanel extends Phaser.GameObjects.Container {
  private backdrop: Phaser.GameObjects.Rectangle;
  private onClose: () => void;

  constructor(
    scene: Phaser.Scene,
    getState: () => SimState,
    onClose: () => void
  ) {
    super(scene, 0, 0);
    this.onClose = onClose;
    scene.add.existing(this);

    this.backdrop = scene.add
      .rectangle(240, 400, 480, 800, 0x000000, 0.55)
      .setInteractive({ useHandCursor: false });
    this.backdrop.on("pointerdown", () => this.dismiss());
    this.add(this.backdrop);

    const panel = scene.add.rectangle(240, 400, 420, 520, 0xfff8dc).setStrokeStyle(2, 0xe8d5b0);
    this.add(panel);

    const title = scene.add.text(240, 170, "STAMP BOOK", {
      fontSize: "18px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add(title);

    const close = scene.add.text(400, 175, "✕", {
      fontSize: "16px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => this.dismiss());
    this.add(close);

    this.rebuildGrid(getState);
    this.setDepth(100);
  }

  rebuildGrid(getState: () => SimState): void {
    const existing = this.list.filter(
      (c) => c instanceof Phaser.GameObjects.Text && c.getData("stampCell")
    );
    existing.forEach((c) => c.destroy());

    refreshStamps(getState());
    const state = getState();
    const earned = new Set(state.stampsEarned);
    const count = earnedStampCount(state);

    const sub = this.scene.add.text(
      240,
      195,
      `${count} / ${STAMP_DEFS.length} earned`,
      { fontSize: "11px", color: MUTED, fontFamily: "system-ui, sans-serif" }
    ).setOrigin(0.5);
    this.add(sub);

    const cols = 4;
    const cellW = 90;
    const startX = 240 - (cols * cellW) / 2 + cellW / 2;
    let row = 0;
    let col = 0;
    STAMP_DEFS.forEach((def) => {
      const x = startX + col * cellW;
      const y = 240 + row * 72;
      const on = earned.has(def.id);
      const cell = this.scene.add.text(x, y, `${def.icon}\n${def.label}`, {
        fontSize: "11px",
        color: on ? INK : MUTED,
        fontFamily: "system-ui, sans-serif",
        align: "center",
      }).setOrigin(0.5);
      cell.setData("stampCell", true);
      cell.setAlpha(on ? 1 : 0.45);
      this.add(cell);
      col += 1;
      if (col >= cols) {
        col = 0;
        row += 1;
      }
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
    }).setOrigin(0.5);
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
