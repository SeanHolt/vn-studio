import { PrismaClient } from '@prisma/client';

export async function seedCipherDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Signal Zero: Deep Space Cipher', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Signal Zero: Deep Space Cipher',
      description:
        'Intercept an encrypted distress beacon from deep space and crack the secret rendezvous coordinates before the signal fades!',
      theme: 'SCIFI',
      enableClock: false,
      isPublished: true,
      playCount: 41,
      likesCount: 24,
      dislikesCount: 0,
      variables: { signalsDecoded: 0 },
    },
  });

  const sComms = `sc_ci_comms_${project.id}`;
  const sTerminal = `sc_ci_term_${project.id}`;
  const sWin = `sc_ci_win_${project.id}`;
  const sLost = `sc_ci_lose_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sComms,
        projectId: project.id,
        name: '1. Long-Range Comms Bay',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'ci_b1', type: 'BACKGROUND', assetUrl: 'css:cyber-grid', transition: 'fade' },
          { id: 'ci_b2', type: 'CHARACTER', name: 'Lieutenant Aria', spriteUrl: 'css:char-captain', position: 'center', action: 'enter', emotion: 'shocked', animation: 'slide-in', voiceStyle: 'HERO' },
          { id: 'ci_b3', type: 'DIALOGUE', speaker: 'Lieutenant Aria', text: 'Captain! We just picked up an encrypted SOS from the lost colony ship! Use the Quantum Decryptor to uncover their rendezvous sector.', voiceStyle: 'HERO' },
          {
            id: 'ci_b4',
            type: 'CHOICE',
            prompt: 'Boot up the Quantum Decryptor?',
            options: [
              { id: 'ci_o1', label: 'Decrypt SOS Transmission', targetSceneId: sTerminal },
            ],
          },
        ],
      },
      {
        id: sTerminal,
        projectId: project.id,
        name: '2. Quantum Decryptor Terminal',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: 'ci_p1',
            type: 'CIPHER_PUZZLE',
            title: 'Decrypt Colony SOS Coordinates',
            clueText: 'Famous deep-space nebula named after a mythical hunter.',
            secretPhrase: 'ORION NEBULA',
            maxWrongGuesses: 6,
            theme: 'SCIFI',
            unlockSceneId: sWin,
            failSceneId: sLost,
          },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: 'Ending 1: Coordinates Locked',
        sceneType: 'ENDING',
        order: 2,
        nodePos: { x: 720, y: 80 },
        blocks: [
          { id: 'ci_w1', type: 'SET_VARIABLE', variableKey: 'signalsDecoded', operation: 'add', value: 1 },
          { id: 'ci_w2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'ci_codebreaker', title: 'Quantum Codebreaker', description: 'Decrypted the deep-space SOS transmission!', icon: '📡' },
          { id: 'ci_w3', type: 'DIALOGUE', speaker: 'Lieutenant Aria', text: 'ORION NEBULA confirmed! Setting warp course to rescue the colony ship now!', voiceStyle: 'HERO' },
        ],
      },
      {
        id: sLost,
        projectId: project.id,
        name: 'Ending 2: Carrier Wave Lost',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 720, y: 290 },
        blocks: [
          { id: 'ci_f1', type: 'DIALOGUE', speaker: 'Lieutenant Aria', text: 'Too many failed decryption attempts—the signal scrambled! Hit Restart to try again.', voiceStyle: 'HERO' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sComms },
  });
}
