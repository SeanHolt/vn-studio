import { PrismaClient } from '@prisma/client';

export async function seedFantasyRpgDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Chronicles of Eldoria: The Sunstone', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Chronicles of Eldoria: The Sunstone',
      description:
        'Explore a 2D top-down fantasy meadow, loot a Health Potion from a chest, watch day turn to night, and battle the Shadow Sentinel!',
      theme: 'FANTASY',
      enableClock: true,
      isPublished: true,
      variables: { gold: 25 },
    },
  });

  const sMap = `sc_fn_map_${project.id}`;
  const sDusk = `sc_fn_dusk_${project.id}`;
  const sBattle = `sc_fn_battle_${project.id}`;
  const sWin = `sc_fn_win_${project.id}`;
  const sLose = `sc_fn_lose_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sMap,
        projectId: project.id,
        name: '1. Emerald Meadow (2D Map)',
        sceneType: 'TOPDOWN',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          {
            id: 'fn_m1',
            type: 'TOPDOWN_ROOM',
            mapTheme: 'GRASSLAND',
            playerIcon: '🧝',
            spawnX: 1,
            spawnY: 4,
            walls: ['4,1', '4,2', '4,5', '4,6', '8,2', '8,3', '8,4'],
            entities: [
              { id: 'fn_e1', label: 'Elder Rowan', kind: 'NPC', icon: '🧙', x: 3, y: 4, dialogueText: 'Grab the Health Potion from the chest before stepping through the East Portal!' },
              { id: 'fn_e2', label: 'Supply Chest', kind: 'CHEST', icon: '🧰', x: 6, y: 2, itemName: 'Health Potion', dialogueText: 'You found a Health Potion! Use it during battle to heal!' },
              { id: 'fn_e3', label: 'Ruins Portal', kind: 'DOOR', icon: '🚪', x: 10, y: 4, targetSceneId: sDusk },
            ],
          },
        ],
      },
      {
        id: sDusk,
        projectId: project.id,
        name: '2. Twilight Ambush',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          { id: 'fn_d1', type: 'BACKGROUND', assetUrl: 'css:emerald-woods', transition: 'dissolve' },
          { id: 'fn_d2', type: 'ADVANCE_TIME', mode: 'SET_EXACT', targetTime: 'NIGHT', dayDelta: 0 },
          { id: 'fn_d3', type: 'CHARACTER', name: 'Shadow Sentinel', spriteUrl: 'css:char-shadow', position: 'center', action: 'enter', emotion: 'angry', animation: 'pulse' },
          { id: 'fn_d4', type: 'DIALOGUE', speaker: 'Shadow Sentinel', text: 'Night falls over Eldoria! Prove your strength in battle to claim the Sunstone!' },
          {
            id: 'fn_d5',
            type: 'CHOICE',
            prompt: 'Prepare for turn-based combat:',
            options: [
              { id: 'fn_o1', label: 'Draw Sword & Fight!', targetSceneId: sBattle },
            ],
          },
        ],
      },
      {
        id: sBattle,
        projectId: project.id,
        name: '3. Shadow Sentinel Battle',
        sceneType: 'BATTLE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: 'fn_bt1',
            type: 'BATTLE_ENCOUNTER',
            backgroundUrl: 'css:starry-night',
            enemyName: 'Shadow Sentinel',
            enemySpriteUrl: 'css:char-shadow',
            enemyMaxHp: 45,
            enemyAttack: 7,
            playerMaxHp: 40,
            playerAttack: 13,
            skillName: 'Sunblade Slash',
            healItemName: 'Health Potion',
            victorySceneId: sWin,
            defeatSceneId: sLose,
          },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: 'Ending 1: Champion of Eldoria',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'fn_w1', type: 'ADVANCE_TIME', mode: 'SET_EXACT', targetTime: 'MORNING', dayDelta: 1 },
          { id: 'fn_w2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'fn_champion', title: 'Champion of Eldoria', description: 'Explored the meadow and defeated the Shadow Sentinel!', icon: '👑' },
          { id: 'fn_w3', type: 'DIALOGUE', speaker: 'Narrator', text: 'Dawn breaks on Day 2 as the Sunstone shines across Eldoria once more!' },
        ],
      },
      {
        id: sLose,
        projectId: project.id,
        name: 'Ending 2: Fallen in the Ruins',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'fn_l1', type: 'DIALOGUE', speaker: 'Narrator', text: 'Tip: Grab the Health Potion from the chest in the meadow and use Defend or Skills!' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sMap },
  });
}
