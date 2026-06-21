import { GAME_HEIGHT } from "../config";
import { MENTOR_DIALOG } from "../data/story";
import { BaseLevelScene, type LevelConfig } from "./BaseLevelScene";

export class LevelGH600AgenticAIScene extends BaseLevelScene {
  constructor() { super({ key: "LevelGH600AgenticAI" }); }
  config(): LevelConfig {
    const ground = GAME_HEIGHT - 40;
    return {
      key: "LevelGH600AgenticAI",
      next: "BossMainline",
      title: "GH-600 GitHub Agentic AI Developer",
      bgKey: "copilot-intro",
      bgTint: 0x8ddfff,
      topColor: 0x0a1f44,
      bottomColor: 0x508ad6,
      worldWidth: 5000,
      platforms: [
        { x: 760, y: ground, w: 1520 },
        { x: 2630, y: ground, w: 800 },
        { x: 4560, y: ground, w: 880 },
        { x: 1660, y: ground - 90, w: 130 },
        { x: 1920, y: ground - 170, w: 130 },
        { x: 2170, y: ground - 110, w: 130 },
        { x: 3020, y: ground - 90, w: 130 },
        { x: 3280, y: ground - 170, w: 130 },
        { x: 3530, y: ground - 170, w: 130 },
        { x: 3730, y: ground - 90, w: 130 },
        { x: 2280, y: ground - 270, w: 180 },
        { x: 3910, y: ground - 280, w: 180 },
      ],
      hiddenPlatforms: [
        { x: 2030, y: ground - 250, w: 170 },
        { x: 3400, y: ground - 290, w: 170 },
      ],
      enemies: [
        { x: 980, y: ground - 60, range: 220 },
        { x: 4520, y: ground - 60, range: 260 },
      ],
      mentor: { x: 4880, y: ground - 80, portraitKey: "copilot-portrait", cropTopFraction: 0.2 },
      rewardKey: "goggles-icon",
      rewardPower: "goggles",
      rewardCaption: "Credential unlocked: GH-600 GitHub Agentic AI Developer",
      mentorDialog: MENTOR_DIALOG.gh600,
      startingPlayerTexture: "adventurer-goggles",
      bgMusic: [415, 523, 622, 784, 622, 523, 415],
      fatalFall: true,
      lavaPits: [
        { x: 1920, y: GAME_HEIGHT - 20, w: 700, h: 40 },
        { x: 3580, y: GAME_HEIGHT - 20, w: 930, h: 40 },
      ],
    };
  }
}
