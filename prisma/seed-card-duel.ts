import { PrismaClient } from '@prisma/client';
import { buildPresetQuestions } from '../src/lib/vn-trivia-presets';

export async function seedCardDuelDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Arcane Duelists: Academy of Cards', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Arcane Duelists: Academy of Cards',
      description:
        'Challenge Archmage Lyra to an Elemental Card Showdown and solve the Sphinx Riddles to earn the Grand Duelist crown!',
      theme: 'ARCADE',
      enableClock: false,
      isPublished: true,
      playCount: 42,
      likesCount: 19,
      dislikesCount: 1,
      variables: { duelistRank: 'Apprentice' },
    },
  });

  const sArena = `sc_cd_arena_${project.id}`;
  const sDuel = `sc_cd_duel_${project.id}`;
  const sRiddle = `sc_cd_riddle_${project.id}`;
  const sWin = `sc_cd_win_${project.id}`;
  const sLose = `sc_cd_lose_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sArena,
        projectId: project.id,
        name: '1. Grand Dueling Hall',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'cd_b1', type: 'BACKGROUND', assetUrl: '/assets/bg-sunset-bay.svg', transition: 'fade' },
          { id: 'cd_b2', type: 'CHARACTER', name: 'Archmage Lyra', spriteUrl: '/assets/char-mage-violet.svg', position: 'center', action: 'enter', emotion: 'happy', animation: 'bounce' },
          { id: 'cd_b3', type: 'DIALOGUE', speaker: 'Archmage Lyra', text: 'Welcome to the Academy! Defeat me in an Elemental Card Duel—or test your wits against the Sphinx Riddles!' },
          { id: 'cd_b4', type: 'AFFINITY', characterName: 'Archmage Lyra', delta: 1, reason: 'Accepted the Academy challenge' },
          {
            id: 'cd_b5',
            type: 'CHOICE',
            prompt: 'How will you prove your mastery?',
            options: [
              { id: 'cd_o1', label: 'Challenge Lyra to Elemental Card Duel', targetSceneId: sDuel },
              { id: 'cd_o2', label: 'Enter the Chamber of Riddles', targetSceneId: sRiddle },
            ],
          },
        ],
      },
      {
        id: sDuel,
        projectId: project.id,
        name: '2. Elemental Card Showdown',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 60 },
        blocks: [
          {
            id: 'cd_d1',
            type: 'CARD_DUEL',
            opponentName: 'Archmage Lyra',
            deckTheme: 'ELEMENTAL',
            roundsToWin: 2,
            victorySceneId: sRiddle,
            defeatSceneId: sLose,
          },
        ],
      },
      {
        id: sRiddle,
        projectId: project.id,
        name: '3. Sphinx Riddle Trial',
        sceneType: 'QUIZ',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: 'cd_q1',
            type: 'QUIZ_CHALLENGE',
            title: 'The Sphinx’s 5 Riddles',
            passingScore: 3,
            questions: buildPresetQuestions('RIDDLES'),
            passSceneId: sWin,
            failSceneId: sLose,
          },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: 'Ending 1: Grand Duelist Crown',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'cd_w1', type: 'SET_VARIABLE', variableKey: 'duelistRank', operation: 'set', value: 'Grandmaster' },
          { id: 'cd_w2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'cd_grandmaster', title: 'Elemental Grandmaster', description: 'Won the Elemental Card Duel and solved the Sphinx Riddles!', icon: '🃏' },
          { id: 'cd_w3', type: 'DIALOGUE', speaker: 'Archmage Lyra', text: 'Brilliant strategy! You are officially promoted to Grandmaster!' },
        ],
      },
      {
        id: sLose,
        projectId: project.id,
        name: 'Ending 2: Back to Training',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'cd_l1', type: 'DIALOGUE', speaker: 'Archmage Lyra', text: 'Remember: Blaze beats Vine, Tidal beats Blaze, and Vine beats Tidal! Try again anytime.' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sArena },
  });
}
