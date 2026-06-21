import Phaser from "phaser";
import {
  addDesignVote,
  addFeedbackSubmission,
  buildPlaytestExport,
  DESIGN_DECISIONS,
  loadPlaytestArchive,
  savePlaytestArchive,
  summarizeArchive,
  type DesignVoteValue,
  type FeedbackCategory,
  type PlaytestArchive,
  type PlaytestSnapshot,
} from "../playtest/feedback.js";
import { buildPlaytestInvite } from "../playtest/recruitment.js";
import { clearSave } from "../sim/persistence.js";

const AMBER = "#ff8c00";
const INK = "#4a3728";
const MUTED = "#8b7355";
const PANEL = 0xfff8dc;
const PANEL_BORDER = 0xe8d5b0;

const FEEDBACK_CATEGORIES: readonly { id: FeedbackCategory; label: string }[] = [
  { id: "bug", label: "Bug" },
  { id: "balance", label: "Balance" },
  { id: "confusion", label: "Confusing" },
  { id: "fun", label: "Fun" },
  { id: "exploit", label: "Exploit" },
  { id: "accessibility", label: "Access" },
];

function storage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | undefined {
  if (typeof localStorage === "undefined") return undefined;
  return localStorage;
}

function askText(message: string, defaultValue = ""): string | null {
  if (typeof window === "undefined") return null;
  return window.prompt(message, defaultValue);
}

function askConfirm(message: string): boolean {
  if (typeof window === "undefined") return false;
  return window.confirm(message);
}

function currentUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

/** Local-first recruitment, feedback, voting, and export modal for playtests. */
export class PlaytestPanel extends Phaser.GameObjects.Container {
  private archive: PlaytestArchive;
  private statusText: Phaser.GameObjects.Text;
  private summaryText: Phaser.GameObjects.Text;
  private recentText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    private getSnapshot: () => PlaytestSnapshot,
    private onClose: () => void
  ) {
    super(scene, 0, 0);
    this.archive = loadPlaytestArchive(storage());
    scene.add.existing(this);

    const backdrop = scene.add
      .rectangle(240, 400, 480, 800, 0x000000, 0.55)
      .setInteractive({ useHandCursor: false });
    backdrop.on("pointerdown", () => this.dismiss());
    this.add(backdrop);

    const panel = scene.add.rectangle(240, 400, 430, 620, PANEL).setStrokeStyle(2, PANEL_BORDER);
    this.add(panel);

    this.add(
      scene.add.text(240, 116, "PLAYTEST HUB", {
        fontSize: "18px",
        color: AMBER,
        fontFamily: "system-ui, sans-serif",
        fontStyle: "bold",
      }).setOrigin(0.5)
    );

    const close = this.button(398, 120, "X", () => this.dismiss(), 28, "#fff8dc", INK);
    this.add(close);

    this.add(
      scene.add.text(
        240,
        146,
        "Volunteer feedback and design votes. Reports stay on this device until you export JSON for the team.",
        {
          fontSize: "11px",
          color: INK,
          fontFamily: "system-ui, sans-serif",
          wordWrap: { width: 376 },
          align: "center",
        }
      ).setOrigin(0.5)
    );

    this.addSectionLabel(88, 188, "SEND FEEDBACK");
    FEEDBACK_CATEGORIES.forEach((category, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      this.add(
        this.button(
          104 + col * 136,
          218 + row * 34,
          category.label,
          () => this.submitFeedback(category.id),
          116
        )
      );
    });

    this.addSectionLabel(87, 300, "VOTE ON DESIGN");
    DESIGN_DECISIONS.forEach((decision, index) => {
      const y = 330 + index * 54;
      this.add(
        scene.add.text(74, y - 13, `${decision.title}: ${decision.prompt}`, {
          fontSize: "9px",
          color: INK,
          fontFamily: "system-ui, sans-serif",
          wordWrap: { width: 330 },
        })
      );
      this.add(this.button(322, y, "Yes", () => this.vote(decision.id, "approve"), 42));
      this.add(this.button(368, y, "No", () => this.vote(decision.id, "reject"), 42));
      this.add(this.button(414, y, "?", () => this.vote(decision.id, "unsure"), 34));
    });

    this.statusText = scene.add.text(240, 548, "", {
      fontSize: "10px",
      color: AMBER,
      fontFamily: "system-ui, sans-serif",
      align: "center",
      wordWrap: { width: 380 },
    }).setOrigin(0.5);
    this.add(this.statusText);

    this.summaryText = scene.add.text(72, 574, "", {
      fontSize: "10px",
      color: MUTED,
      fontFamily: "monospace",
    });
    this.add(this.summaryText);

    this.recentText = scene.add.text(72, 596, "", {
      fontSize: "9px",
      color: INK,
      fontFamily: "system-ui, sans-serif",
      wordWrap: { width: 340 },
    });
    this.add(this.recentText);

    this.add(this.button(138, 690, "Copy invite", () => this.copyInvite(), 140));
    this.add(this.button(316, 690, "Export JSON", () => this.exportArchive(), 140));
    this.add(
      this.button(227, 722, "Reset game save", () => this.resetGameSave(), 180, "#fff8dc", INK)
    );
    this.setDepth(100);
    this.refreshSummary();
  }

  dismiss(): void {
    this.onClose();
    this.destroy(true);
  }

  private addSectionLabel(x: number, y: number, text: string): void {
    this.add(
      this.scene.add.text(x, y, text, {
        fontSize: "10px",
        color: INK,
        fontFamily: "monospace",
        fontStyle: "bold",
      }).setOrigin(0, 0.5)
    );
  }

  private submitFeedback(category: FeedbackCategory): void {
    const message = askText(
      "What happened? Useful reports include what you did, what you expected, and what felt wrong or right."
    );
    if (!message || message.trim().length === 0) {
      this.setStatus("No feedback saved.");
      return;
    }

    const consent = askConfirm(
      "May the team use this feedback and the attached local play snapshot to improve Yes Man?"
    );
    if (!consent) {
      this.setStatus("Feedback was not saved because consent was not granted.");
      return;
    }

    const testerAlias = askText("Optional tester name or handle for follow-up:", "")?.trim();
    const submission = addFeedbackSubmission(this.archive, {
      category,
      consentToUse: true,
      message,
      testerAlias: testerAlias || undefined,
      snapshot: this.getSnapshot(),
    });
    savePlaytestArchive(this.archive, storage());
    this.setStatus(`Saved as ${submission.triage.bucket} (${submission.triage.score}).`);
    this.refreshSummary();
  }

  private vote(decisionId: string, vote: DesignVoteValue): void {
    const note = askText("Optional note about this design decision:", "")?.trim();
    addDesignVote(this.archive, {
      decisionId,
      vote,
      note: note || undefined,
      snapshot: this.getSnapshot(),
    });
    savePlaytestArchive(this.archive, storage());
    this.setStatus("Design vote saved locally.");
    this.refreshSummary();
  }

  private resetGameSave(): void {
    const ok = askConfirm(
      "Reset your game save? Cheer, generators, and upgrades will be cleared. Stamps and lifetime stats reset too. Playtest feedback stays unless you clear browser data."
    );
    if (!ok) {
      this.setStatus("Save not reset.");
      return;
    }
    clearSave(storage());
    this.setStatus("Save cleared. Reloading…");
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 400);
    }
  }

  private exportArchive(): void {
    const exported = buildPlaytestExport(this.archive);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(exported).catch(() => undefined);
    }

    if (typeof document !== "undefined") {
      const blob = new Blob([exported], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `yes-man-playtest-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    this.setStatus("Export created. Share the JSON file with the project team.");
  }

  private copyInvite(): void {
    const url = currentUrl();
    if (!url) {
      this.setStatus("Invite copy is only available in a browser.");
      return;
    }

    const invite = buildPlaytestInvite(url);
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "Playtest Yes Man", text: invite.shortText, url: invite.url })
        .then(() => this.setStatus("Invite shared."))
        .catch(() => this.copyInviteText(invite.longText));
      return;
    }

    this.copyInviteText(invite.longText);
  }

  private copyInviteText(text: string): void {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard
        .writeText(text)
        .then(() => this.setStatus("Invite copied. Share it with a tester."))
        .catch(() => this.setStatus("Invite ready, but clipboard copy was blocked."));
      return;
    }

    this.setStatus("Invite ready, but clipboard copy is unavailable in this browser.");
  }

  private refreshSummary(): void {
    const counts = summarizeArchive(this.archive);
    this.summaryText.setText(
      `Feedback: ${this.archive.submissions.length}  actionable ${counts.actionable} / review ${counts.needs_review} / noise ${counts.likely_noise}  votes ${this.archive.votes.length}`
    );

    const recent = this.archive.submissions
      .slice(0, 2)
      .map((submission) => {
        const text =
          submission.normalizedMessage.length > 70
            ? `${submission.normalizedMessage.slice(0, 67)}...`
            : submission.normalizedMessage;
        return `${submission.triage.bucket}: ${text}`;
      })
      .join("\n");
    this.recentText.setText(recent || "No feedback yet. Invite testers to send one concrete note after a short session.");
  }

  private setStatus(message: string): void {
    this.statusText.setText(message);
  }

  private button(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    width = 96,
    backgroundColor = AMBER,
    color = "#ffffff"
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const rect = this.scene.add
      .rectangle(0, 0, width, 24, Phaser.Display.Color.HexStringToColor(backgroundColor).color)
      .setStrokeStyle(1, PANEL_BORDER)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add.text(0, 0, label, {
      fontSize: "10px",
      color,
      fontFamily: "system-ui, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5);
    rect.on("pointerdown", onClick);
    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", onClick);
    container.add([rect, text]);
    return container;
  }
}
