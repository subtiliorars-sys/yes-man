import Phaser from "phaser";
import { buyGenerator, formatCheer, generatorCost } from "../sim/engine.js";
import { GENERATOR_DEFS } from "../sim/economy.js";
import type { SimState } from "../sim/types.js";

const GEN_ICONS = ["🐕", "🤝", "🤖", "⚡", "👴", "😜", "🌌"] as const;

const SKY_TOP = 0x87ceeb;
const HILL = 0x6ab040;
const DOMINO = 0xfff8dc;
const DOMINO_OWNED = 0xffe8b0;
const DOMINO_BORDER = 0xe8d5b0;
const AMBER = 0xff8c00;

type RefreshCb = () => void;

/** Domino / wishing-well generator shop — simplified from HTML prototype (YM-W3). */
export class DominoPanel extends Phaser.GameObjects.Container {
  private dominoSprites: Phaser.GameObjects.Container[] = [];
  private onChanged: RefreshCb;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private getState: () => SimState,
    onChanged: RefreshCb
  ) {
    super(scene, x, y);
    this.onChanged = onChanged;
    scene.add.existing(this);
    this.rebuild();
  }

  refresh(): void {
    this.rebuild();
  }

  private shouldShow(state: SimState): boolean {
    const anyOwned = state.genOwned.some((n) => n > 0);
    const anyAffordable = GENERATOR_DEFS.some((_, i) => state.cheer >= generatorCost(i, state));
    return anyOwned || anyAffordable;
  }

  private rebuild(): void {
    this.removeAll(true);
    this.dominoSprites = [];

    const state = this.getState();
    if (!this.shouldShow(state)) {
      this.setVisible(false);
      return;
    }
    this.setVisible(true);

    const prog = Math.min(state.totalCheerEarned / 50_000, 1);
    const sky = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(SKY_TOP),
      Phaser.Display.Color.ValueToColor(0x5a9fd4),
      100,
      Math.floor(prog * 100)
    );
    const skyColor = Phaser.Display.Color.GetColor(sky.r, sky.g, sky.b);
    this.add(
      this.scene.add.rectangle(224, 28, 448, 56, skyColor).setOrigin(0, 0)
    );
    this.add(
      this.scene.add.rectangle(224, 84, 448, 48, HILL).setOrigin(0, 0)
    );
    this.add(
      this.scene.add.rectangle(224, 120, 448, 36, 0x4682b4, 0.35).setOrigin(0, 0)
    );

    const trackY = 92;
    const startX = 24;
    const gap = 58;
    GENERATOR_DEFS.forEach((def, i) => {
      const owned = state.genOwned[i] ?? 0;
      const cost = generatorCost(i, state);
      const canBuy = state.cheer >= cost && owned === 0;
      const locked = !canBuy && owned === 0;

      const piece = this.scene.add.container(startX + i * gap, trackY);
      const fill = owned > 0 ? DOMINO_OWNED : DOMINO;
      const rect = this.scene.add
        .rectangle(0, 0, 34, 54, fill)
        .setStrokeStyle(2, owned > 0 ? AMBER : DOMINO_BORDER);
      const icon = this.scene.add
        .text(0, -8, GEN_ICONS[i] ?? "?", { fontSize: "16px" })
        .setOrigin(0.5);
      const label = this.scene.add
        .text(0, 10, def.name.split(" ")[0] ?? def.name, {
          fontSize: "7px",
          color: "#8b7355",
          fontFamily: "system-ui, sans-serif",
        })
        .setOrigin(0.5);

      piece.add([rect, icon, label]);

      if (owned > 0) {
        const badge = this.scene.add
          .text(14, -22, String(owned), {
            fontSize: "9px",
            color: "#5f9ea0",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#ffffff",
            padding: { x: 3, y: 1 },
          })
          .setOrigin(0.5);
        piece.add(badge);
      } else if (!locked) {
        const costTxt = this.scene.add
          .text(0, 22, formatCheer(cost), {
            fontSize: "8px",
            color: "#ff8c00",
            fontFamily: "system-ui, sans-serif",
            fontStyle: "bold",
          })
          .setOrigin(0.5);
        piece.add(costTxt);
        rect.setInteractive({ useHandCursor: true });
        rect.on("pointerdown", () => {
          if (buyGenerator(state, i)) {
            this.pulsePiece(piece);
            this.onChanged();
            this.rebuild();
          }
        });
      } else {
        piece.setAlpha(0.35);
      }

      this.dominoSprites.push(piece);
      this.add(piece);
    });

    this.add(
      this.scene.add.text(224, 8, "AUTO-YESERS", {
        fontSize: "10px",
        color: "#4a3728",
        fontFamily: "monospace",
        fontStyle: "bold",
      }).setOrigin(0.5, 0)
    );
  }

  private pulsePiece(piece: Phaser.GameObjects.Container): void {
    this.scene.tweens.add({
      targets: piece,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 120,
      yoyo: true,
    });
  }
}
