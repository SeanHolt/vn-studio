import { PrismaClient } from '@prisma/client';
import { generateSolvableBoard } from '../src/lib/vn-circuit';

export async function seedCircuitPuzzleDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Aether Core: Circuit Breach', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Aether Core: Circuit Breach',
      description:
        'Rotate glowing neon wire relays to restore reactor power, uncover a sabotage log, and confront the suspect with hard evidence!',
      theme: 'SCIFI',
      enableClock: false,
      isPublished: true,
      playCount: 54,
      likesCount: 27,
      dislikesCount: 1,
      variables: { powerRestored: false },
    },
  });

  const sIntro = `sc_cp_intro_${project.id}`;
  const sBoard = `sc_cp_board_${project.id}`;
  const sInterrogate = `sc_cp_evid_${project.id}`;
  const sWin = `sc_cp_win_${project.id}`;
  const sFail = `sc_cp_fail_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sIntro,
        projectId: project.id,
        name: '1. Darkened Reactor Bay',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'cp_b1', type: 'BACKGROUND', assetUrl: '/assets/bg-night-sky.svg', transition: 'fade' },
          { id: 'cp_b2', type: 'CHARACTER', name: 'Engineer Kael', spriteUrl: '/assets/char-hero-blue.svg', position: 'center', action: 'enter', emotion: 'shocked', animation: 'slide-in', voiceStyle: 'HERO' },
          { id: 'cp_b3', type: 'DIALOGUE', speaker: 'Engineer Kael', text: 'Someone scrambled the main power conduits! Take this Security Keycard—you will need it once we route power to the exit lock.', voiceStyle: 'HERO' },
          { id: 'cp_b4', type: 'INVENTORY', action: 'give', itemName: 'Security Keycard' },
          {
            id: 'cp_b5',
            type: 'CHOICE',
            prompt: 'Open the 5×5 relay panel?',
            options: [
              { id: 'cp_o1', label: 'Patch 5×5 Circuit Board', targetSceneId: sBoard },
            ],
          },
        ],
      },
      {
        id: sBoard,
        projectId: project.id,
        name: '2. 5×5 Neon Circuit Relay',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: 'cp_p1',
            type: 'CIRCUIT_PUZZLE',
            title: 'Connect Power ⚡ to Exit Lock',
            theme: 'SCIFI_CIRCUIT',
            gridSize: 5,
            sourceRow: 1,
            targetRow: 3,
            maxMoves: 0,
            tiles: generateSolvableBoard(5, 1, 3),
            unlockSceneId: sInterrogate,
            failSceneId: sFail,
          },
        ],
      },
      {
        id: sInterrogate,
        projectId: project.id,
        name: '3. Suspect Cross-Examination',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          { id: 'cp_i1', type: 'SET_VARIABLE', variableKey: 'powerRestored', operation: 'set', value: true },
          { id: 'cp_i2', type: 'CHARACTER', name: 'Inspector Vance', spriteUrl: '/assets/char-mage-violet.svg', position: 'center', action: 'enter', emotion: 'angry', animation: 'shake', voiceStyle: 'NARRATOR' },
          {
            id: 'cp_i3',
            type: 'EVIDENCE_CHECK',
            speaker: 'Inspector Vance',
            statement: 'Impossible! Nobody has clearance to enter the Reactor Bay tonight!',
            requiredItem: 'Security Keycard',
            hintText: 'Present the keycard Engineer Kael handed you!',
            wrongItemReply: 'That does not prove you were authorized to be here!',
            maxStrikes: 3,
            successSceneId: sWin,
            failSceneId: sFail,
          },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: 'Ending 1: Reactor Online',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'cp_w1', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'cp_master_tech', title: 'Master Circuit Tech', description: 'Solved the 5×5 circuit relay and proved your clearance!', icon: '🔌' },
          { id: 'cp_w2', type: 'DIALOGUE', speaker: 'Inspector Vance', text: 'A valid Security Keycard! Apologies, Investigator—the station is saved!', voiceStyle: 'NARRATOR' },
        ],
      },
      {
        id: sFail,
        projectId: project.id,
        name: 'Ending 2: Station Blackout',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'cp_f1', type: 'DIALOGUE', speaker: 'Narrator', text: 'Backup generators failed. Hit Restart to try the circuit relay again!', voiceStyle: 'NARRATOR' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sIntro },
  });
}
