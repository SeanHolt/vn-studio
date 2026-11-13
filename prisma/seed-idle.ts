import { PrismaClient } from '@prisma/client';
import { instantiateIdlePreset } from '../src/lib/vn-idle';

export async function seedIdleTycoonDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Asteroid Belt Tycoon: 10-Tier Idle', userId: null },
  });

  const preset = instantiateIdlePreset('SPACE_MINING');

  const project = await prisma.project.create({
    data: {
      title: 'Asteroid Belt Tycoon: 10-Tier Idle',
      description:
        'Mine Star Credits, catch floating 10x Golden Frenzy Orbs, Prestige Ascend for permanent Star Shards, and fund your Warp Cruiser!',
      theme: 'ARCADE',
      enableClock: false,
      isPublished: true,
      playCount: 89,
      likesCount: 44,
      dislikesCount: 2,
      variables: { credits: 0 },
    },
  });

  const sBriefing = `sc_id_brief_${project.id}`;
  const sTycoon = `sc_id_play_${project.id}`;
  const sVictory = `sc_id_win_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sBriefing,
        projectId: project.id,
        name: '1. Mining Guild Contract',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'id_b1', type: 'BACKGROUND', assetUrl: 'css:starship-bridge', transition: 'fade' },
          { id: 'id_b2', type: 'CHARACTER', name: 'Commander Nova', spriteUrl: 'css:char-captain', position: 'center', action: 'enter', emotion: 'happy', animation: 'bounce', voiceStyle: 'HERO' },
          { id: 'id_b3', type: 'DIALOGUE', speaker: 'Commander Nova', text: 'Your outpost starts with zero Star Credits! Catch floating Golden Orbs for a 10x Frenzy, or Prestige Ascend for permanent Star Shards on your way to 10,000 Credits!', voiceStyle: 'HERO' },
          {
            id: 'id_b4',
            type: 'CHOICE',
            prompt: 'Ready to start your mining empire?',
            options: [
              { id: 'id_o1', label: 'Launch Refinery Floor', targetSceneId: sTycoon },
            ],
          },
        ],
      },
      {
        id: sTycoon,
        projectId: project.id,
        name: '2. Asteroid Belt Refinery (Idle)',
        sceneType: 'IDLE',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: 'id_t1',
            type: 'IDLE_TYCOON',
            title: preset.title,
            currencyName: preset.currencyName,
            clickerLabel: preset.clickerLabel,
            clickerIcon: preset.clickerIcon,
            baseClickPower: 1,
            goalAmount: 10000,
            variableKey: 'credits',
            enablePrestige: true,
            prestigeThreshold: 2500,
            enableGoldenOrbs: true,
            upgrades: preset.upgrades,
            goalSceneId: sVictory,
          },
        ],
      },
      {
        id: sVictory,
        projectId: project.id,
        name: 'Ending: Warp Cruiser Funded',
        sceneType: 'ENDING',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          { id: 'id_w1', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'id_mogul', title: 'Asteroid Mogul', description: 'Built a 10-tier space mining operation and earned 10,000+ Star Credits!', icon: '💎' },
          { id: 'id_w2', type: 'DIALOGUE', speaker: 'Commander Nova', text: 'Incredible work! You cashed out {{credits}} Star Credits and unlocked deep-space warp travel!', voiceStyle: 'HERO' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sBriefing },
  });
}
