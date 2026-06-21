import { GAME_HEIGHT } from "../config";
import { MENTOR_DIALOG } from "../data/story";
import { BaseLevelScene, type LevelConfig } from "./BaseLevelScene";

export class LevelGH200ActionsScene extends BaseLevelScene {
  constructor() { super({ key: "LevelGH200Actions" }); }
  config(): LevelConfig {
    const ground = GAME_HEIGHT - 40;
    return {
      key: "LevelGH200Actions",
      next: "LevelGH600AgenticAI",
      title: "GH-200 GitHub Actions",
      bgKey: "ducky-intro",
      bgTint: 0xffc570,
      topColor: 0x0e2742,
      bottomColor: 0x2575c4,
      worldWidth: 4600,
      platforms: [
        { x: 2300, y: ground, w: 4600 },
        { x: 560, y: ground - 140, w: 170 },
        { x: 900, y: ground - 250, w: 150 },
        { x: 1280, y: ground - 180, w: 160 },
        { x: 1750, y: ground - 310, w: 170 },
        { x: 2240, y: ground - 200, w: 180 },
        { x: 2700, y: ground - 330, w: 180 },
        { x: 3180, y: ground - 240, w: 180 },
        { x: 3680, y: ground - 150, w: 190 },
        { x: 4120, y: ground - 240, w: 170 },
      ],
      fogBlocks: [
        { x: 1520, y: ground - 14, w: 80 },
        { x: 1520, y: ground - 62, w: 80 },
        { x: 1520, y: ground - 110, w: 80 },
        { x: 3380, y: ground - 14, w: 90 },
        { x: 3380, y: ground - 62, w: 90 },
      ],
      enemies: [
        { x: 960, y: ground - 60, range: 180 },
        { x: 2380, y: ground - 60, range: 240 },
        { x: 3860, y: ground - 60, range: 200 },
      ],
      mentor: { x: 4370, y: ground - 80, portraitKey: "ducky-portrait", cropTopFraction: 0.18 },
      rewardKey: "bubbles-icon",
      rewardPower: "bubbles",
      rewardCaption: "Credential unlocked: GH-200 GitHub Actions",
      mentorDialog: MENTOR_DIALOG.gh200,
      startingPlayerTexture: "adventurer-bubbles",
      bgMusic: [330, 349, 392, 523, 392, 349, 330],
    };
  }
}
