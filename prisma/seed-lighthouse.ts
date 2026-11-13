import { PrismaClient } from '@prisma/client';

export async function seedLighthouseDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'The Clockwork Lighthouse', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'The Clockwork Lighthouse',
      description:
        'A coastal mystery featuring name customization, rain & firefly weather effects, point-and-click clues, character bonds, and hidden endings.',
      theme: 'MODERN',
      enableClock: false,
      isPublished: true,
      variables: { playerName: 'Traveler', courage: 1 },
    },
  });

  const sIntro = `sc_lh_intro_${project.id}`;
  const sWoods = `sc_lh_woods_${project.id}`;
  const sTower = `sc_lh_tower_${project.id}`;
  const sEndHero = `sc_lh_end_hero_${project.id}`;
  const sEndQuiet = `sc_lh_end_quiet_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sIntro,
        projectId: project.id,
        name: '1. Arrival at the Pier',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'lh_b1', type: 'BACKGROUND', assetUrl: 'css:stormy-moor', transition: 'fade' },
          { id: 'lh_fx1', type: 'WEATHER_FX', weather: 'RAIN', intensity: 'NORMAL' },
          { id: 'lh_b2', type: 'PLAY_AUDIO', audioType: 'BGM', soundUrl: 'synth:ambient-calm', loop: true, action: 'play' },
          { id: 'lh_b3', type: 'CHARACTER', name: 'Keeper Clara', spriteUrl: 'css:char-keeper', position: 'center', action: 'enter', emotion: 'happy', animation: 'slide-in' },
          { id: 'lh_b4', type: 'DIALOGUE', speaker: 'Keeper Clara', text: 'Thank goodness a boat arrived before the storm worsens! The lighthouse prism has gone dark.' },
          { id: 'lh_b5', type: 'INPUT_TEXT', prompt: 'Before we begin, what is your name?', placeholder: 'Enter your name...', targetVariable: 'playerName', defaultValue: 'Sam' },
          { id: 'lh_b6', type: 'AFFINITY', characterName: 'Keeper Clara', delta: 2, reason: 'Answered her call for help' },
          { id: 'lh_b7', type: 'DIALOGUE', speaker: 'Keeper Clara', text: 'Welcome, {{playerName}}! I dropped the Brass Key near the Whispering Woods.' },
          {
            id: 'lh_b8',
            type: 'CHOICE',
            prompt: 'Where will you go first, {{playerName}}?',
            options: [
              { id: 'lh_o1', label: 'Search the Whispering Woods (Point & Click)', targetSceneId: sWoods },
              { id: 'lh_o2', label: 'Climb straight to the Lighthouse Door', targetSceneId: sTower },
            ],
          },
        ],
      },
      {
        id: sWoods,
        projectId: project.id,
        name: '2. Whispering Woods (Sandbox)',
        sceneType: 'HOTSPOT',
        order: 1,
        nodePos: { x: 380, y: 60 },
        blocks: [
          { id: 'lh_fx2', type: 'WEATHER_FX', weather: 'FIREFLIES', intensity: 'NORMAL' },
          {
            id: 'lh_w1',
            type: 'HOTSPOT_ROOM',
            backgroundUrl: 'css:emerald-woods',
            promptText: 'Click the glowing objects in the woods to search for the Brass Key!',
            hotspots: [
              { id: 'lh_hz1', label: 'Hollow Pine Stump', x: 18, y: 55, width: 22, height: 25, actionType: 'GIVE_ITEM', itemName: 'Brass Key', dialogueText: 'Inside the moss-covered stump, you find the Brass Key!' },
              { id: 'lh_hz2', label: 'Ancient Rune Stone', x: 52, y: 42, width: 18, height: 24, actionType: 'SET_VARIABLE', variableKey: 'courage', variableValue: 5, dialogueText: 'Touching the warm stone fills you with courage (+5)!' },
              { id: 'lh_hz3', label: 'Trail to Lighthouse', x: 76, y: 62, width: 20, height: 26, actionType: 'JUMP_SCENE', targetSceneId: sTower },
            ],
          },
        ],
      },
      {
        id: sTower,
        projectId: project.id,
        name: '3. The Locked Lantern Door',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          { id: 'lh_fx3', type: 'WEATHER_FX', weather: 'CLEAR', intensity: 'LIGHT' },
          { id: 'lh_t1', type: 'BACKGROUND', assetUrl: 'css:starry-night', transition: 'fade-black' },
          { id: 'lh_t2', type: 'DIALOGUE', speaker: 'Narrator', text: 'At the top of the spiral stairs stands the heavy iron lantern room door.' },
          { id: 'lh_t3', type: 'BRANCH', checkType: 'HAS_ITEM', itemName: 'Brass Key', trueSceneId: sEndHero, falseSceneId: sEndQuiet },
        ],
      },
      {
        id: sEndHero,
        projectId: project.id,
        name: 'Ending 1: Beacon Restored',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'lh_cam1', type: 'CAMERA_FX', effect: 'FLASH_WHITE', intensity: 'STRONG' },
          { id: 'lh_eh1', type: 'PLAY_AUDIO', audioType: 'SFX', soundUrl: 'synth:chime', loop: false, action: 'play' },
          { id: 'lh_eh2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'lh_beacon_hero', title: 'Keeper of the Light', description: 'Found the Brass Key and relit the Clockwork Lighthouse!', icon: '🏆' },
          { id: 'lh_eh3', type: 'CHARACTER', name: 'Keeper Clara', spriteUrl: 'css:char-keeper', position: 'center', action: 'enter', emotion: 'happy', animation: 'bounce' },
          { id: 'lh_eh4', type: 'DIALOGUE', speaker: 'Keeper Clara', text: 'You unlocked the prism, {{playerName}}! The ships are safe tonight.' },
        ],
      },
      {
        id: sEndQuiet,
        projectId: project.id,
        name: 'Ending 2: Locked Out',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'lh_eq1', type: 'CHARACTER', name: 'Keeper Clara', spriteUrl: 'css:char-keeper', position: 'center', action: 'enter', emotion: 'sad', animation: 'none' },
          { id: 'lh_eq2', type: 'DIALOGUE', speaker: 'Keeper Clara', text: 'The iron door will not budge without the Brass Key from the woods, {{playerName}}.' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sIntro },
  });
}
