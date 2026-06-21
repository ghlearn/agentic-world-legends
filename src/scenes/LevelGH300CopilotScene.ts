import { GAME_HEIGHT } from "../config";
import { MENTOR_DIALOG } from "../data/story";
import { BaseLevelScene, type LevelConfig } from "./BaseLevelScene";

export class LevelGH300CopilotScene extends BaseLevelScene {
  constructor() { super({ key: "LevelGH300Copilot" }); }
  config(): LevelConfig {
    const ground = GAME_HEIGHT - 40;
    return {
      key: "LevelGH300Copilot",
      next: "LevelGH200Actions",
      title: "GH-300 GitHub Copilot",
      bgKey: "mona-intro",
      bgTint: 0xb08cff,
      topColor: 0x1f1447,
      bottomColor: 0x6c63ff,
      worldWidth: 4400,
      platforms: [
        { x: 700, y: ground, w: 1400 },
        { x: 2400, y: ground, w: 600 },
        { x: 4000, y: ground, w: 800 },
        { x: 1500, y: ground - 90, w: 130 },
        { x: 1750, y: ground - 160, w: 130 },
        { x: 2000, y: ground - 90, w: 130 },
        { x: 2850, y: ground - 90, w: 130 },
        { x: 3100, y: ground - 170, w: 130 },
        { x: 3350, y: ground - 170, w: 130 },
        { x: 3550, y: ground - 90, w: 130 },
        { x: 1600, y: ground - 260, w: 180 },
        { x: 3700, y: ground - 280, w: 180 },
      ],
      hiddenPlatforms: [
        { x: 1850, y: ground - 240, w: 160 },
        { x: 3050, y: ground - 280, w: 160 },
      ],
      enemies: [
        { x: 900, y: ground - 60, range: 220 },
        { x: 4250, y: ground - 60, range: 220 },
      ],
      mentor: { x: 4300, y: ground - 80, portraitKey: "mona-portrait", cropTopFraction: 0.14 },
      rewardKey: "fork-icon",
      rewardPower: "fork",
      rewardCaption: "Credential unlocked: GH-300 GitHub Copilot",
      mentorDialog: MENTOR_DIALOG.gh300,
      startingPlayerTexture: "adventurer-fork",
      bgMusic: [392, 494, 587, 698, 880, 698, 587, 494],
      lavaPits: [
        { x: 1750, y: GAME_HEIGHT - 20, w: 700, h: 40 },
        { x: 3150, y: GAME_HEIGHT - 20, w: 900, h: 40 },
      ],
    };
  }
}
