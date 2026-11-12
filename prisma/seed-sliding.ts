import { PrismaClient } from '@prisma/client';

export async function seedSlidingPuzzleDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'The Sunken Temple: Rune Vault', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'The Sunken Temple: Rune Vault',
      description:
        'Slide ancient stone tiles back into alignment to restore the Sun Seal mosaic and unlock the Elder Rune Vault!',
      theme: 'FANTASY',
      enableClock: false,
      isPublished: true,
      playCount: 38,
      likesCount: 22,
      dislikesCount: 0,
      variables: { sealsRestored: 0 },
    },
  });

  const sEntrance = `sc_sp_ent_${project.id}`;
  const sImageSeal = `sc_sp_img_${project.id}`;
  const sRuneLock = `sc_sp_rune_${project.id}`;
  const sTreasure = `sc_sp_win_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sEntrance,
        projectId: project.id,
        name: '1. Moss-Covered Courtyard',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'sp_b1', type: 'BACKGROUND', assetUrl: '/assets/bg-forest-mist.svg', transition: 'fade' },
          { id: 'sp_b2', type: 'CHARACTER', name: 'Scholar Mira', spriteUrl: '/assets/char-mage-violet.svg', position: 'center', action: 'enter', emotion: 'happy', animation: 'slide-in', voiceStyle: 'MYSTIC' },
          { id: 'sp_b3', type: 'DIALOGUE', speaker: 'Scholar Mira', text: 'Look at the temple gate! Its stone mosaic has been scrambled—slide the tiles back into place to open the inner vault!', voiceStyle: 'MYSTIC' },
          {
            id: 'sp_b4',
            type: 'CHOICE',
            prompt: 'Which puzzle seal will you attempt first?',
            options: [
              { id: 'sp_o1', label: '3×3 Sunset Mosaic Seal (Image Slice)', targetSceneId: sImageSeal },
              { id: 'sp_o2', label: '3×3 Elder Arcane Rune Lock (Runes)', targetSceneId: sRuneLock },
            ],
          },
        ],
      },
      {
        id: sImageSeal,
        projectId: project.id,
        name: '2. 3×3 Sunset Mosaic Seal',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 80 },
        blocks: [
          {
            id: 'sp_p1',
            type: 'SLIDING_PUZZLE',
            title: 'Restore the 3×3 Temple Mosaic',
            gridSize: 3,
            puzzleMode: 'IMAGE',
            imageUrl: '/assets/bg-sunset-bay.svg',
            runeTheme: 'ARCANE',
            maxMoves: 0,
            unlockSceneId: sRuneLock,
          },
        ],
      },
      {
        id: sRuneLock,
        projectId: project.id,
        name: '3. Elder Arcane Rune Lock',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: 'sp_p2',
            type: 'SLIDING_PUZZLE',
            title: 'Align the 8 Elder Runes',
            gridSize: 3,
            puzzleMode: 'RUNES',
            imageUrl: '/assets/bg-night-sky.svg',
            runeTheme: 'ARCANE',
            maxMoves: 0,
            unlockSceneId: sTreasure,
          },
        ],
      },
      {
        id: sTreasure,
        projectId: project.id,
        name: 'Ending: Vault of the Ancients',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 180 },
        blocks: [
          { id: 'sp_w1', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'sp_seal_master', title: 'Master of the Runes', description: 'Solved both the Mosaic Seal and Elder Rune sliding puzzles!', icon: '🏛️' },
          { id: 'sp_w2', type: 'DIALOGUE', speaker: 'Scholar Mira', text: 'The ancient vault doors swing wide open! What a brilliant display of logic!', voiceStyle: 'MYSTIC' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sEntrance },
  });
}
