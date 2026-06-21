import { GAME_HEIGHT } from "../config";
import { MENTOR_DIALOG } from "../data/story";
import { BaseLevelScene, type LevelConfig } from "./BaseLevelScene";

export class LevelGH500AdvancedSecurityScene extends BaseLevelScene {
  constructor() { super({ key: "LevelGH500AdvancedSecurity" }); }
  config(): LevelConfig {
    const ground = GAME_HEIGHT - 40;
    return {
      key: "LevelGH500AdvancedSecurity",
      next: "LevelGH300Copilot",
      title: "GH-500 GitHub Advanced Security",
      bgKey: "copilot-intro",
      bgTint: 0x6cd0ff,
      topColor: 0x0a1f44,
      bottomColor: 0x6cd0ff,
      worldWidth: 4300,
      platforms: [
        { x: 2150, y: ground, w: 4300 },
        { x: 620, y: ground - 130, w: 180 },
        { x: 980, y: ground - 250, w: 160 },
        { x: 1380, y: ground - 160, w: 180 },
        { x: 1850, y: ground - 290, w: 170 },
        { x: 2350, y: ground - 220, w: 190 },
        { x: 2860, y: ground - 320, w: 180 },
        { x: 3340, y: ground - 210, w: 190 },
        { x: 3760, y: ground - 150, w: 200 },
      ],
      hiddenPlatforms: [
        { x: 1520, y: ground - 250, w: 130 },
        { x: 3040, y: ground - 290, w: 130 },
      ],
      enemies: [
        { x: 940, y: ground - 60, range: 180 },
        { x: 2100, y: ground - 60, range: 210 },
        { x: 3460, y: ground - 60, range: 220 },
      ],
      mentor: { x: 4100, y: ground - 80, portraitKey: "copilot-portrait", cropTopFraction: 0.2 },
      rewardKey: "goggles-icon",
      rewardPower: "goggles",
      rewardCaption: "Credential unlocked: GH-500 GitHub Advanced Security",
      mentorDialog: MENTOR_DIALOG.gh500,
      startingPlayerTexture: "adventurer-goggles",
      bgMusic: [392, 440, 554, 622, 554, 440],
    };
  }
}
