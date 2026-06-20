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
import { formatAwayTime } from "../sim/offline.js";
import { refreshStamps } from "../sim/stamps.js";
import { showNewStampToasts, StampBookPanel } from "./StampBookPanel.js";
import { isSfxMuted, playClickPop, playPrestigeArpeggio, playPromptYes, setSfxMuted } from "../audio/sfx.js";
import { snapshotFromState } from "../playtest/feedback.js";
import { shouldOpenPlaytestHub } from "../playtest/recruitment.js";
import { PlaytestPanel } from "./PlaytestPanel.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#999977";

const BG_TIERS = [
  { threshold: 0, color: 0xfff8dc },
  { threshold: 1_000, color: 0xfff0d4 },
  { threshold: 10_000, color: 0xffe8c8 },
  { threshold: 100_000, color: 0xffe0bc },
  { threshold: 500_000, color: 0xffd8b0 },
  { threshold: 2_000_000, color: 0xffd0a4 },
] as const;

const CLICK_MILESTONES = [100, 500, 1_000, 5_000, 10_000] as const;

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
  private yesCircle!: Phaser.GameObjects.Arc;
  private muteBtn?: Phaser.GameObjects.Text;
  private prestigeBtn?: Phaser.GameObjects.Text;
  private dominoPanel?: DominoPanel;
  private stampBtn?: Phaser.GameObjects.Text;
  private stampBook?: StampBookPanel;
  private playtestBtn?: Phaser.GameObjects.Text;
  private playtestPanel?: PlaytestPanel;
  private promptGroup?: Phaser.GameObjects.Container;
  private pendingPrompt: PromptDef | null = null;
  private saveTimer?: Phaser.Time.TimerEvent;
  private bgRect?: Phaser.GameObjects.Rectangle;
  private huePhase = 0;

  constructor() {
    super("GameScene");
  }

  create(): void {
    const loaded = tryLoad(storage());
    this.state = loaded?.state ?? createState();

    this.bgRect = this.add.rectangle(240, 400, 480, 800, BG_TIERS[0].color).setOrigin(0.5);
    this.bgRect.setDepth(-10);

    if (loaded && loaded.offlineEarned > 0) {
      this.time.delayedCall(400, () => {
        this.showWelcomeBack(loaded.awaySeconds, loaded.offlineEarned);
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

    this.muteBtn = this.add.text(16, 22, isSfxMuted() ? "Sound off" : "Sound on", {
      fontSize: "10px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#fff8dc",
      padding: { x: 5, y: 2 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.muteBtn.on("pointerdown", () => {
      setSfxMuted(!isSfxMuted());
      this.muteBtn?.setText(isSfxMuted() ? "Sound off" : "Sound on");
    });

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

    this.playtestBtn = this.add.text(240, 124, "Playtest + feedback", {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#ff8c00",
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.playtestBtn.on("pointerdown", () => this.openPlaytestHub());

    const circle = this.add.circle(240, 250, 82, 0xffb347).setStrokeStyle(4, 0xff8c00);
    this.yesCircle = circle;
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

    if (this.input.keyboard) {
      const onKeyYes = (event: KeyboardEvent) => {
        if (event.repeat || this.pendingPrompt || this.playtestPanel || this.stampBook) return;
        this.handleYes();
      };
      this.input.keyboard.on("keydown-SPACE", onKeyYes);
      this.input.keyboard.on("keydown-ENTER", onKeyYes);
    }

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

    if (typeof window !== "undefined" && shouldOpenPlaytestHub(window.location.search)) {
      this.time.delayedCall(250, () => this.openPlaytestHub());
    }
  }

  update(_time: number, delta: number): void {
    tick(this.state, delta / 1000);
    this.refreshBackgroundTier();
    this.refreshButtonHue(delta);
    this.refreshUi();
  }

  private refreshBackgroundTier(): void {
    if (!this.bgRect) return;
    let color: number = BG_TIERS[0].color;
    for (const tier of BG_TIERS) {
      if (this.state.totalCheerEarned >= tier.threshold) color = tier.color;
    }
    this.bgRect.setFillStyle(color);
  }

  /** GDD: button background shifts slowly through warm colors. */
  private refreshButtonHue(delta: number): void {
    this.huePhase += delta / 300_000;
    const t = (Math.sin(this.huePhase * Math.PI * 2) + 1) / 2;
    const fill = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffb347),
      Phaser.Display.Color.ValueToColor(0xffa07a),
      100,
      Math.floor(t * 100)
    );
    const c = Phaser.Display.Color.GetColor(fill.r, fill.g, fill.b);
    this.yesCircle.setFillStyle(c);
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

  private openPlaytestHub(): void {
    if (this.playtestPanel) return;
    this.playtestPanel = new PlaytestPanel(this, () => {
      return snapshotFromState(this.state, totalCps(this.state));
    }, () => {
      this.playtestPanel = undefined;
    });
  }

  private handleYes(): void {
    const result = clickYes(this.state);
    this.yesBtn.setText(
      YES_VARIANTS[Math.floor(Math.random() * YES_VARIANTS.length)] ?? "YES"
    );
    this.playYesSquash();
    this.spawnClickParticles();
    playClickPop();
    if (result.cascadeTriggered) {
      this.showFloat("YES CASCADE!", 240, 200);
    }
    this.showFloat(`+${formatCheer(result.cheerGained)}`, 240, 220);
    this.maybeCelebrateClickMilestone();
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
      playPromptYes();
      this.spawnClickParticles();
      this.showFloat(`+${formatCheer(prompt.bonus * this.state.prestigeMultiplier)}`, 240, 200);
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

  private showWelcomeBack(awaySeconds: number, earned: number): void {
    const g = this.add.container(0, 0);
    const bg = this.add.rectangle(240, 130, 400, 72, 0xfff8dc, 0.95).setStrokeStyle(2, 0xff8c00);
    const title = this.add.text(240, 108, "Welcome back!", {
      fontSize: "14px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const detail = this.add.text(
      240,
      132,
      `Away ${formatAwayTime(awaySeconds)} · Auto-yesers earned +${formatCheer(earned)} Cheer`,
      {
        fontSize: "11px",
        color: INK,
        fontFamily: "system-ui, sans-serif",
        align: "center",
        wordWrap: { width: 360 },
      }
    ).setOrigin(0.5);
    g.add([bg, title, detail]);
    this.tweens.add({
      targets: g,
      alpha: 0,
      y: -12,
      delay: 3200,
      duration: 600,
      onComplete: () => g.destroy(true),
    });
  }

  private maybeCelebrateClickMilestone(): void {
    const n = this.state.lifetimeClicks;
    if (!(CLICK_MILESTONES as readonly number[]).includes(n)) return;
    this.showFloat(`${n.toLocaleString()} yeses!`, 240, 165);
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
        playPrestigeArpeggio();
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

  /** GDD: 1.0 → 0.85 → 1.05 → 1.0 over 150ms */
  private playYesSquash(): void {
    const targets = [this.yesBtn, this.yesCircle];
    targets.forEach((t) => {
      t.setScale(1);
    });
    this.tweens.add({
      targets,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 50,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.tweens.add({
          targets,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 50,
          ease: "Quad.easeOut",
          onComplete: () => {
            this.tweens.add({
              targets,
              scaleX: 1,
              scaleY: 1,
              duration: 50,
              ease: "Quad.easeInOut",
            });
          },
        });
      },
    });
  }

  private spawnClickParticles(): void {
    const n = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i += 1) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 28 + Math.random() * 36;
      const dot = this.add.circle(240, 250, 3 + Math.random() * 2, 0xffd700, 0.9);
      this.tweens.add({
        targets: dot,
        x: 240 + Math.cos(angle) * dist,
        y: 250 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 320 + Math.random() * 180,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
  }
}
