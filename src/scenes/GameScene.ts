import Phaser from "phaser";
import {
  acceptPrompt,
  buyUpgrade,
  canPrestige,
  clickYes,
  createState,
  doPrestige,
  formatCheer,
  nextPrompt,
  tick,
  totalCps,
} from "../sim/engine.js";
import { UPGRADE_DEFS, YES_VARIANTS } from "../sim/economy.js";
import { tryLoad, trySave } from "../sim/persistence.js";
import type { PromptDef, SimState } from "../sim/types.js";
import { DominoPanel } from "./DominoPanel.js";
import { refreshStamps } from "../sim/stamps.js";
import { showNewStampToasts, StampBookPanel } from "./StampBookPanel.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#999977";

function storage(): Pick<Storage, "getItem" | "setItem"> | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage;
}

export class GameScene extends Phaser.Scene {
  private state!: SimState;
  private txtCheer!: Phaser.GameObjects.Text;
  private txtCps!: Phaser.GameObjects.Text;
  private txtStats!: Phaser.GameObjects.Text;
  private yesBtn!: Phaser.GameObjects.Text;
  private prestigeBtn?: Phaser.GameObjects.Text;
  private dominoPanel?: DominoPanel;
  private stampBtn?: Phaser.GameObjects.Text;
  private stampBook?: StampBookPanel;
  private promptGroup?: Phaser.GameObjects.Container;
  private pendingPrompt: PromptDef | null = null;
  private saveTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("GameScene");
  }

  create(): void {
    const loaded = tryLoad(storage());
    this.state = loaded?.state ?? createState();
    if (loaded && loaded.offlineEarned > 0) {
      this.time.delayedCall(400, () => {
        this.showFloat(`While away: +${formatCheer(loaded.offlineEarned)} Cheer`, 240, 120);
      });
    }
    this.checkStamps();

    this.add.text(240, 20, "YES MAN", {
      fontSize: "26px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.stampBtn = this.add.text(448, 22, "Stamps", {
      fontSize: "11px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#fff8dc",
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    this.stampBtn.on("pointerdown", () => this.openStampBook());

    this.txtCheer = this.add.text(240, 56, "0 Cheer", {
      fontSize: "20px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.txtCps = this.add.text(240, 80, "0 Cheer/sec", {
      fontSize: "13px",
      color: "#a08060",
      fontFamily: "system-ui, sans-serif",
    }).setOrigin(0.5);

    this.txtStats = this.add.text(240, 100, "", {
      fontSize: "11px",
      color: "#a08060",
      fontFamily: "system-ui, sans-serif",
    }).setOrigin(0.5);

    const circle = this.add.circle(240, 250, 82, 0xffb347).setStrokeStyle(4, 0xff8c00);
    this.yesBtn = this.add.text(240, 250, "YES", {
      fontSize: "34px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    circle.setInteractive({ useHandCursor: true });
    this.yesBtn.setInteractive({ useHandCursor: true });
    const onYes = () => this.handleYes();
    circle.on("pointerdown", onYes);
    this.yesBtn.on("pointerdown", onYes);

    this.dominoPanel = new DominoPanel(this, 16, 330, () => this.state, () => {
      trySave(this.state, storage());
      this.checkStamps();
      this.refreshUi();
    });

    this.add.text(16, 478, "UPGRADES", {
      fontSize: "11px",
      color: INK,
      fontFamily: "monospace",
      fontStyle: "bold",
    });

    let uy = 496;
    UPGRADE_DEFS.forEach((_u, i) => {
      const row = this.add.text(16, uy, "", {
        fontSize: "10px",
        color: INK,
        fontFamily: "monospace",
        wordWrap: { width: 448 },
      });
      row.setInteractive({ useHandCursor: true });
      row.on("pointerdown", () => {
        if (buyUpgrade(this.state, i)) {
          trySave(this.state, storage());
          this.checkStamps();
          this.refreshUi();
        }
      });
      row.setName(`upg-${i}`);
      uy += 24;
    });

    this.saveTimer = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => trySave(this.state, storage()),
    });

    this.events.on("shutdown", () => {
      trySave(this.state, storage());
      this.saveTimer?.destroy();
    });

    this.refreshUi();
  }

  update(_time: number, delta: number): void {
    tick(this.state, delta / 1000);
    this.refreshUi();
  }

  private checkStamps(): void {
    const fresh = refreshStamps(this.state);
    if (fresh.length > 0) {
      showNewStampToasts(this, fresh);
    }
    this.updateStampButtonLabel();
  }

  private updateStampButtonLabel(): void {
    if (!this.stampBtn) return;
    const n = this.state.stampsEarned.length;
    this.stampBtn.setText(n > 0 ? `Stamps (${n})` : "Stamps");
  }

  private openStampBook(): void {
    if (this.stampBook) return;
    this.stampBook = new StampBookPanel(this, () => this.state, () => {
      this.stampBook = undefined;
      this.updateStampButtonLabel();
    });
  }

  private handleYes(): void {
    const result = clickYes(this.state);
    this.yesBtn.setText(
      YES_VARIANTS[Math.floor(Math.random() * YES_VARIANTS.length)] ?? "YES"
    );
    this.tweens.add({
      targets: [this.yesBtn],
      scaleX: 0.88,
      scaleY: 0.88,
      duration: 75,
      yoyo: true,
    });
    if (result.cascadeTriggered) {
      this.showFloat("YES CASCADE!", 240, 200);
    }
    this.showFloat(`+${formatCheer(result.cheerGained)}`, 240, 220);
    if (result.promptReady && !this.pendingPrompt) {
      this.pendingPrompt = nextPrompt(this.state);
      this.showPrompt(this.pendingPrompt);
    }
    trySave(this.state, storage());
    this.checkStamps();
    this.refreshUi();
  }

  private showPrompt(prompt: PromptDef): void {
    this.promptGroup?.destroy(true);
    const g = this.add.container(0, 0);
    const bg = this.add.rectangle(240, 310, 420, 110, 0xf5e6cc).setStrokeStyle(2, 0xe8d5b0);
    const text = this.add.text(240, 278, prompt.text, {
      fontSize: "12px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      wordWrap: { width: 380 },
      align: "center",
    }).setOrigin(0.5);
    const flavor = this.add.text(240, 302, prompt.flavor, {
      fontSize: "10px",
      color: "#a08060",
      fontFamily: "system-ui, sans-serif",
      fontStyle: "italic",
      wordWrap: { width: 360 },
      align: "center",
    }).setOrigin(0.5);
    const btn = this.add.text(240, 338, `SAY YES (+${prompt.bonus})`, {
      fontSize: "13px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: AMBER,
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      acceptPrompt(this.state, prompt);
      this.pendingPrompt = null;
      g.destroy(true);
      this.promptGroup = undefined;
      trySave(this.state, storage());
      this.checkStamps();
      this.refreshUi();
    });
    g.add([bg, text, flavor, btn]);
    this.promptGroup = g;
  }

  private showFloat(text: string, x: number, y: number): void {
    const t = this.add.text(x, y, text, {
      fontSize: "15px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 750,
      onComplete: () => t.destroy(),
    });
  }

  private ensurePrestigeButton(): void {
    if (this.prestigeBtn) return;
    this.prestigeBtn = this.add.text(240, 318, "", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#6a5acd",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.prestigeBtn.on("pointerdown", () => {
      if (doPrestige(this.state)) {
        this.showFloat("Fresh outlook!", 240, 180);
        trySave(this.state, storage());
        this.checkStamps();
        this.refreshUi();
      }
    });
  }

  private refreshUi(): void {
    this.txtCheer.setText(`${formatCheer(this.state.cheer)} Cheer`);
    this.txtCps.setText(`${formatCheer(totalCps(this.state))} Cheer/sec`);
    this.txtStats.setText(
      `Earned ${formatCheer(this.state.totalCheerEarned)} · Prestige x${this.state.prestigeMultiplier.toFixed(2)} (${this.state.prestiges})`
    );

    this.dominoPanel?.refresh();

    UPGRADE_DEFS.forEach((def, i) => {
      const row = this.children.getByName(`upg-${i}`) as Phaser.GameObjects.Text | null;
      if (!row) return;
      const bought = this.state.upgPurchased[i];
      if (bought) {
        row.setColor(MUTED);
        row.setText(`✓ ${def.name} — ${def.desc}`);
        row.disableInteractive();
        return;
      }
      row.setInteractive({ useHandCursor: true });
      row.setColor(this.state.cheer >= def.cost ? INK : MUTED);
      row.setText(`${def.name} — ${def.desc} (${formatCheer(def.cost)})`);
    });

    if (canPrestige(this.state)) {
      this.ensurePrestigeButton();
      this.prestigeBtn!.setVisible(true);
      this.prestigeBtn!.setText("A Fresh Outlook (prestige)");
    } else if (this.prestigeBtn) {
      this.prestigeBtn.setVisible(false);
    }

    this.updateStampButtonLabel();
  }
}
