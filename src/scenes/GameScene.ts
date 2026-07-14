import Phaser from "phaser";
import {
  acceptPrompt,
  buyUpgrade,
  canPrestige,
  clickYes,
  collectGoldenYes,
  createState,
  doPrestige,
  formatCheer,
  nextPrompt,
  prestigeThreshold,
  tick,
  totalCps,
} from "../sim/engine.js";
import {
  GOLDEN_LIFETIME_SECONDS,
  GOLDEN_MAX_SECONDS,
  GOLDEN_MIN_SECONDS,
  UPGRADE_DEFS,
  YES_VARIANTS,
} from "../sim/economy.js";
import { tryLoad, trySave } from "../sim/persistence.js";
import type { PromptDef, SimState } from "../sim/types.js";
import { DominoPanel } from "./DominoPanel.js";
import { formatAwayTime } from "../sim/offline.js";
import { earnedStampCount, refreshStamps, STAMP_DEFS } from "../sim/stamps.js";
import { showNewStampToasts, StampBookPanel } from "./StampBookPanel.js";
import { SettingsPanel } from "./SettingsPanel.js";
import {
  isSfxMuted,
  playClickPop,
  playGeneratorTick,
  playPrestigeArpeggio,
  playPromptYes,
} from "../audio/sfx.js";
import { snapshotFromState } from "../playtest/feedback.js";
import { shouldOpenPlaytestHub } from "../playtest/recruitment.js";
import { PlaytestPanel } from "./PlaytestPanel.js";
import { applyMinTapTarget } from "../ui/tapTarget.js";
import { isReduceMotion } from "../sim/prefs.js";
import {
  discoverSecret,
  evaluatePassiveSecrets,
  foundSecretCount,
  SECRET_COUNT,
  type SecretDef,
} from "../sim/secrets.js";

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

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
] as const;
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
  private prestigeBtn?: Phaser.GameObjects.Text;
  private dominoPanel?: DominoPanel;
  private stampBtn?: Phaser.GameObjects.Text;
  private stampBook?: StampBookPanel;
  private playtestBtn?: Phaser.GameObjects.Text;
  private playtestPanel?: PlaytestPanel;
  private settingsPanel?: SettingsPanel;
  private promptGroup?: Phaser.GameObjects.Container;
  private pendingPrompt: PromptDef | null = null;
  private saveTimer?: Phaser.Time.TimerEvent;
  private goldenTimer?: Phaser.Time.TimerEvent;
  private goldenBubble?: Phaser.GameObjects.Container;
  private bgRect?: Phaser.GameObjects.Rectangle;
  private huePhase = 0;
  private genChimeElapsed = 0;
  private prestigeHint?: Phaser.GameObjects.Text;
  private prestigeConfirm?: Phaser.GameObjects.Container;
  private yesHitRadius = 82;
  private titleTaps = 0;
  private konamiIndex = 0;
  private offlineSecondsPending = 0;

  constructor() {
    super("GameScene");
  }

  create(): void {
    const loaded = tryLoad(storage());
    this.state = loaded?.state ?? createState();

    this.bgRect = this.add.rectangle(240, 400, 480, 800, BG_TIERS[0].color).setOrigin(0.5);
    this.bgRect.setDepth(-10);
    this.offlineSecondsPending = loaded?.offlineSeconds ?? 0;
    if (loaded && loaded.offlineEarned > 0) {
      this.time.delayedCall(400, () => {
        this.showWelcomeBack(loaded.offlineSeconds, loaded.offlineEarned);
      });
    }

    const title = this.add.text(240, 20, "YES MAN", {
      fontSize: "26px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    title.on("pointerdown", () => this.handleTitleTap(title));

    this.stampBtn = this.add.text(464, 22, "Collection", {
      fontSize: "11px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#fff8dc",
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    applyMinTapTarget(this.stampBtn);
    this.stampBtn.on("pointerdown", () => this.openStampBook());

    const gear = this.add.text(16, 22, "⚙", {
      fontSize: "18px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    applyMinTapTarget(gear);
    gear.on("pointerdown", () => this.openSettings());

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
    }).setOrigin(0.5);
    applyMinTapTarget(this.playtestBtn);
    this.playtestBtn.on("pointerdown", () => this.openPlaytestHub());

    const narrow =
      typeof window !== "undefined" &&
      (window.innerWidth < 520 || window.innerHeight < 740);
    this.yesHitRadius = narrow ? 94 : 82;

    const circle = this.add.circle(240, 250, this.yesHitRadius, 0xffb347).setStrokeStyle(4, 0xff8c00);
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
        if (
          event.repeat ||
          this.pendingPrompt ||
          this.playtestPanel ||
          this.settingsPanel ||
          this.stampBook ||
          this.prestigeConfirm
        ) {
          return;
        }
        this.handleYes();
      };
      this.input.keyboard.on("keydown-SPACE", onKeyYes);
      this.input.keyboard.on("keydown-ENTER", onKeyYes);
      this.input.keyboard.on("keydown-ESC", () => this.dismissTopOverlay());
    }

    if (narrow) {
      this.yesBtn.setFontSize(38);
      this.add.text(240, 768, "Scroll for upgrades ↓", {
        fontSize: "9px",
        color: MUTED,
        fontFamily: "system-ui, sans-serif",
      }).setOrigin(0.5);
    }

    this.dominoPanel = new DominoPanel(this, 16, 330, () => this.state, () => {
      trySave(this.state, storage());
      this.checkProgress();
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
      applyMinTapTarget(row);
      row.on("pointerdown", () => {
        if (buyUpgrade(this.state, i)) {
          trySave(this.state, storage());
          this.checkProgress();
          this.refreshUi();
        }
      });
      row.setName(`upg-${i}`);
      uy += 24;
    });

    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => this.handleKonami(e));

    this.saveTimer = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => trySave(this.state, storage()),
    });
    this.scheduleGolden(true);

    this.events.on("shutdown", () => {
      trySave(this.state, storage());
      this.saveTimer?.destroy();
      this.goldenTimer?.destroy();
    });

    this.checkProgress();
    this.refreshUi();

    if (typeof window !== "undefined" && shouldOpenPlaytestHub(window.location.search)) {
      this.time.delayedCall(250, () => this.openPlaytestHub());
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    tick(this.state, dt);
    this.state.playSeconds += dt;
    this.maybePlayGeneratorChime(delta);
    this.refreshBackgroundTier();
    this.refreshButtonHue(delta);
    this.refreshUi();
  }

  private maybePlayGeneratorChime(deltaMs: number): void {
    if (isSfxMuted()) return;
    const cps = totalCps(this.state);
    if (cps <= 0) return;
    this.genChimeElapsed += deltaMs;
    if (this.genChimeElapsed < 2000) return;
    this.genChimeElapsed = 0;
    const owned: number[] = [];
    this.state.genOwned.forEach((n, i) => {
      for (let k = 0; k < n; k += 1) owned.push(i);
    });
    if (owned.length === 0) return;
    const pick = owned[Math.floor(Math.random() * owned.length)] ?? 0;
    playGeneratorTick(pick);
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
    if (isReduceMotion()) return;
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

  // ---- progress / collectibles -------------------------------------------

  /** Refresh stamps + Easter eggs and celebrate anything newly earned. */
  private checkProgress(): void {
    const ctx = {
      localHour: new Date().getHours(),
      offlineSeconds: this.offlineSecondsPending,
    };
    this.offlineSecondsPending = 0;
    const newSecrets = evaluatePassiveSecrets(this.state, ctx);
    this.maybeCompletionist();
    if (newSecrets.length > 0) this.celebrateSecrets(newSecrets);

    const freshStamps = refreshStamps(this.state);
    if (freshStamps.length > 0) {
      showNewStampToasts(this, freshStamps);
      if (freshStamps.includes("the_journey")) this.celebrateFinale();
    }
    this.updateStampButtonLabel();
  }

  /** The "found everything" wink — auto-discovered, never required. */
  private maybeCompletionist(): void {
    if (this.state.secretsFound.includes("completionist")) return;
    const othersFound = foundSecretCount(this.state); // completionist not yet counted
    const allStamps =
      earnedStampCount(this.state) >= STAMP_DEFS.length - 1; // the_journey may lag a tick
    if (othersFound >= SECRET_COUNT - 1 && allStamps) {
      const def = discoverSecret(this.state, "completionist");
      if (def) this.celebrateSecrets([def]);
    }
  }

  private celebrateSecrets(defs: SecretDef[]): void {
    defs.forEach((def, i) => {
      this.time.delayedCall(i * 250, () => {
        this.showFloat(`✨ Secret: ${def.icon} ${def.label}`, 240, 150);
        this.time.delayedCall(500, () => this.showFloat(def.reveal, 240, 176, 2600));
      });
    });
    trySave(this.state, storage());
  }

  private celebrateFinale(): void {
    this.showFloat("🌈 You said yes to all of it. Thank you. 🌈", 240, 250, 4000);
  }

  private updateStampButtonLabel(): void {
    if (!this.stampBtn) return;
    const stamps = earnedStampCount(this.state);
    const secrets = foundSecretCount(this.state);
    this.stampBtn.setText(
      stamps > 0 || secrets > 0 ? `Collection (${stamps + secrets})` : "Collection"
    );
  }

  private openStampBook(): void {
    if (this.stampBook || this.settingsPanel || this.playtestPanel) return;
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

  private openSettings(): void {
    if (this.settingsPanel || this.stampBook) return;
    this.settingsPanel = new SettingsPanel(this, () => this.state, {
      onClose: () => {
        this.settingsPanel = undefined;
      },
      onChange: () => {
        trySave(this.state, storage());
        this.refreshUi();
      },
      onReplaceState: (s) => {
        this.state = s;
        this.offlineSecondsPending = 0;
        trySave(this.state, storage());
        this.checkProgress();
        this.refreshUi();
        this.showFloat("Welcome back!", 240, 200);
      },
      onSecret: (id) => {
        const def = discoverSecret(this.state, id);
        if (def) this.celebrateSecrets([def]);
      },
    });
  }

  /** Dismiss the topmost modal overlay — Escape key and future dismiss hooks. */
  private dismissTopOverlay(): void {
    if (this.settingsPanel) {
      this.settingsPanel.dismiss();
      return;
    }
    if (this.playtestPanel) {
      this.playtestPanel.dismiss();
      return;
    }
    if (this.stampBook) {
      this.stampBook.dismiss();
      return;
    }
    if (this.prestigeConfirm) {
      this.prestigeConfirm.destroy(true);
      this.prestigeConfirm = undefined;
    }
  }

  // ---- core loop ----------------------------------------------------------
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
    this.checkProgress();
    this.refreshUi();
  }

  private handleTitleTap(title: Phaser.GameObjects.Text): void {
    this.titleTaps += 1;
    this.tweens.add({ targets: title, angle: { from: -4, to: 4 }, duration: 80, yoyo: true });
    if (this.titleTaps >= 7) {
      this.titleTaps = 0;
      const def = discoverSecret(this.state, "title_tapper");
      if (def) {
        this.celebrateSecrets([def]);
        trySave(this.state, storage());
      }
    }
  }

  private handleKonami(e: KeyboardEvent): void {
    const want = KONAMI[this.konamiIndex];
    if (e.key === want || e.key.toLowerCase() === want) {
      this.konamiIndex += 1;
      if (this.konamiIndex >= KONAMI.length) {
        this.konamiIndex = 0;
        const def = discoverSecret(this.state, "konami");
        if (def) {
          this.celebrateSecrets([def]);
          trySave(this.state, storage());
        }
      }
    } else {
      this.konamiIndex = e.key === KONAMI[0] ? 1 : 0;
    }
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
    }).setOrigin(0.5);
    applyMinTapTarget(btn);
    btn.on("pointerdown", () => {
      acceptPrompt(this.state, prompt);
      playPromptYes();
      this.spawnClickParticles();
      this.showFloat(`+${formatCheer(prompt.bonus * this.state.prestigeMultiplier)}`, 240, 200);
      this.pendingPrompt = null;
      g.destroy(true);
      this.promptGroup = undefined;
      trySave(this.state, storage());
      this.checkProgress();
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

  private showFloat(text: string, x: number, y: number, lifeMs = 750): void {
    const t = this.add.text(x, y, text, {
      fontSize: "15px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5).setDepth(80);
    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: lifeMs,
      onComplete: () => t.destroy(),
    });
  }

  private ensurePrestigeButton(): void {
    if (this.prestigeBtn) return;
    this.prestigeBtn = this.add.text(240, 306, "", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#6a5acd",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5);
    applyMinTapTarget(this.prestigeBtn);
    this.prestigeHint = this.add.text(240, 328, "", {
      fontSize: "9px",
      color: "#7a6aad",
      fontFamily: "system-ui, sans-serif",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5, 0);
    this.prestigeBtn.on("pointerdown", () => this.openPrestigeConfirm());
  }

  private openPrestigeConfirm(): void {
    if (this.prestigeConfirm || !canPrestige(this.state)) return;
    const g = this.add.container(0, 0);
    const dim = this.add.rectangle(240, 400, 480, 800, 0x000000, 0.35).setInteractive();
    const card = this.add.rectangle(240, 300, 360, 130, 0xfff8dc).setStrokeStyle(2, 0x6a5acd);
    const nextMult = (1 + (this.state.prestiges + 1) * 0.25).toFixed(2);
    const title = this.add.text(240, 262, "A Fresh Outlook?", {
      fontSize: "14px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const body = this.add.text(
      240,
      290,
      `Resets Cheer & generators · Keeps stamps & prompt progress\nPermanent mult → x${nextMult}`,
      {
        fontSize: "10px",
        color: INK,
        fontFamily: "system-ui, sans-serif",
        align: "center",
        wordWrap: { width: 320 },
      }
    ).setOrigin(0.5);
    const yesBtn = this.add.text(190, 330, "Yes, refresh", {
      fontSize: "11px",
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#6a5acd",
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
    applyMinTapTarget(yesBtn);
    const noBtn = this.add.text(290, 330, "Not yet", {
      fontSize: "11px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#fff8dc",
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
    applyMinTapTarget(noBtn);
    const close = () => {
      g.destroy(true);
      this.prestigeConfirm = undefined;
    };
    yesBtn.on("pointerdown", () => {
      if (doPrestige(this.state)) {
        playPrestigeArpeggio();
        this.showFloat("Fresh outlook!", 240, 180);
        trySave(this.state, storage());
        this.checkProgress();
        this.refreshUi();
      }
      close();
    });
    noBtn.on("pointerdown", close);
    dim.on("pointerdown", close);
    g.add([dim, card, title, body, yesBtn, noBtn]);
    this.prestigeConfirm = g;
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
      applyMinTapTarget(row);
      row.setColor(this.state.cheer >= def.cost ? INK : MUTED);
      row.setText(`${def.name} — ${def.desc} (${formatCheer(def.cost)})`);
    });

    if (canPrestige(this.state)) {
      this.ensurePrestigeButton();
      this.prestigeBtn!.setVisible(true);
      this.prestigeBtn!.setText("A Fresh Outlook (prestige)");
      const threshold = prestigeThreshold(this.state);
      const nextMult = (1 + (this.state.prestiges + 1) * 0.25).toFixed(2);
      this.prestigeHint?.setVisible(true);
      this.prestigeHint?.setText(
        `At ${formatCheer(threshold)} earned · reset run → x${nextMult} mult · optional`
      );
    } else {
      if (this.prestigeBtn) this.prestigeBtn.setVisible(false);
      this.prestigeHint?.setVisible(false);
    }

    this.updateStampButtonLabel();
  }

  // ---- golden yes ---------------------------------------------------------

  private scheduleGolden(first = false): void {
    const min = first ? 25 : GOLDEN_MIN_SECONDS;
    const max = first ? 55 : GOLDEN_MAX_SECONDS;
    const delay = (min + Math.random() * (max - min)) * 1000;
    this.goldenTimer = this.time.delayedCall(delay, () => this.spawnGolden());
  }

  private spawnGolden(): void {
    if (this.goldenBubble) {
      this.scheduleGolden();
      return;
    }
    const fromLeft = Math.random() < 0.5;
    const y = 150 + Math.random() * 120;
    const startX = fromLeft ? -40 : 520;
    const endX = fromLeft ? 520 : -40;

    const bubble = this.add.container(startX, y).setDepth(70);
    const glow = this.add.circle(0, 0, 30, 0xfff2b0, 0.5);
    const core = this.add.circle(0, 0, 24, 0xffd54a).setStrokeStyle(3, 0xffb300);
    const label = this.add.text(0, 0, "YES!", {
      fontSize: "14px",
      color: "#7a5200",
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    bubble.add([glow, core, label]);
    bubble.setSize(56, 56);
    bubble.setInteractive(
      new Phaser.Geom.Circle(0, 0, 30),
      Phaser.Geom.Circle.Contains
    );
    bubble.on("pointerdown", () => this.collectGolden(bubble));
    this.goldenBubble = bubble;

    if (!isReduceMotion()) {
      this.tweens.add({
        targets: bubble,
        scale: { from: 0.9, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }
    this.tweens.add({
      targets: bubble,
      x: endX,
      duration: GOLDEN_LIFETIME_SECONDS * 1000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (this.goldenBubble === bubble) {
          bubble.destroy();
          this.goldenBubble = undefined;
          this.scheduleGolden();
        }
      },
    });
  }

  private collectGolden(bubble: Phaser.GameObjects.Container): void {
    if (this.goldenBubble !== bubble) return;
    const reward = collectGoldenYes(this.state);
    playClickPop();
    this.showFloat(`✨ GOLDEN YES! +${formatCheer(reward)} ✨`, 240, bubble.y - 10, 1200);
    this.tweens.killTweensOf(bubble);
    this.tweens.add({
      targets: bubble,
      scale: 1.6,
      alpha: 0,
      duration: 250,
      onComplete: () => bubble.destroy(),
    });
    this.goldenBubble = undefined;
    trySave(this.state, storage());
    this.checkProgress();
    this.refreshUi();
    this.scheduleGolden();
  }

  // ---- juice --------------------------------------------------------------

  /** GDD: 1.0 → 0.85 → 1.05 → 1.0 over 150ms */
  private playYesSquash(): void {
    const targets = [this.yesBtn, this.yesCircle];
    if (isReduceMotion()) {
      targets.forEach((t) => t.setScale(1));
      return;
    }
    targets.forEach((t) => t.setScale(1));
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
    if (isReduceMotion()) return;
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
