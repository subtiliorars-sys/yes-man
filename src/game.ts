import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }
  create(): void {
    this.scene.start("GameScene");
  }
}

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#fff8dc",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 480,
      height: 800,
    },
    scene: [BootScene, GameScene],
  });
}
