import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, PHYSICS } from "./config";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { TitleScene } from "./scenes/TitleScene";
import { IntroScene } from "./scenes/IntroScene";
import { LevelGH100AdminScene } from "./scenes/LevelGH100AdminScene";
import { LevelGH900FoundationsScene } from "./scenes/LevelGH900FoundationsScene";
import { LevelGH500AdvancedSecurityScene } from "./scenes/LevelGH500AdvancedSecurityScene";
import { LevelGH300CopilotScene } from "./scenes/LevelGH300CopilotScene";
import { LevelGH200ActionsScene } from "./scenes/LevelGH200ActionsScene";
import { LevelGH600AgenticAIScene } from "./scenes/LevelGH600AgenticAIScene";
import { BossMainlineScene } from "./scenes/BossMainlineScene";
import { VictoryScene } from "./scenes/VictoryScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0d1117",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: PHYSICS.gravity },
      debug: false,
    },
  },
  pixelArt: false,
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    IntroScene,
    LevelGH100AdminScene,
    LevelGH900FoundationsScene,
    LevelGH500AdvancedSecurityScene,
    LevelGH300CopilotScene,
    LevelGH200ActionsScene,
    LevelGH600AgenticAIScene,
    BossMainlineScene,
    VictoryScene,
    GameOverScene,
  ],
};

new Phaser.Game(config);
