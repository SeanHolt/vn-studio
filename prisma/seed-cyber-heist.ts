import { PrismaClient } from '@prisma/client';

export async function seedCyberHeistDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Cyber Heist: Neon Vault', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Cyber Heist: Neon Vault',
      description:
        'Dodge laser grids with Quick-Time reflex bars and crack the mainframe password before security locks down the vault!',
      theme: 'SCIFI',
      enableClock: false,
      isPublished: true,
      playCount: 67,
      likesCount: 31,
      dislikesCount: 2,
      variables: { stealthScore: 100 },
    },
  });

  const sCorridor = `sc_ch_corr_${project.id}`;
  const sLaserQte = `sc_ch_qte_${project.id}`;
  const sVaultPass = `sc_ch_pass_${project.id}`;
  const sEscape = `sc_ch_win_${project.id}`;
  const sCaught = `sc_ch_lose_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sCorridor,
        projectId: project.id,
        name: '1. Neon Security Corridor',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'ch_b1', type: 'BACKGROUND', assetUrl: '/assets/bg-night-sky.svg', transition: 'fade' },
          { id: 'ch_b2', type: 'CHARACTER', name: 'Cipher', spriteUrl: '/assets/char-hero-blue.svg', position: 'left', action: 'enter', emotion: 'happy', animation: 'slide-in' },
          { id: 'ch_b3', type: 'DIALOGUE', speaker: 'Cipher', text: 'We are inside the Neon Vault! The mainframe password is STARLIGHT. Watch out for the sweeping laser grid ahead!' },
          { id: 'ch_b4', type: 'TIMER', action: 'start', label: 'Firewall Trace', durationSeconds: 35, timeoutSceneId: sCaught },
          {
            id: 'ch_b5',
            type: 'CHOICE',
            prompt: 'Ready to slip past the laser sensors?',
            options: [
              { id: 'ch_o1', label: 'Leap Through Laser Grid (Reflex QTE)', targetSceneId: sLaserQte },
            ],
          },
        ],
      },
      {
        id: sLaserQte,
        projectId: project.id,
        name: '2. Laser Grid Reflex Jump',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: 'ch_q1',
            type: 'QTE_ACTION',
            promptText: 'Hit SPACE or Click inside the green zone to dodge the laser!',
            speed: 'NORMAL',
            zoneStart: 36,
            zoneWidth: 28,
            successSceneId: sVaultPass,
            failSceneId: sCaught,
          },
        ],
      },
      {
        id: sVaultPass,
        projectId: project.id,
        name: '3. Mainframe Password Lock',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: 'ch_p1',
            type: 'KEYPAD_PUZZLE',
            lockMode: 'PASSWORD',
            promptText: 'Enter the secret mainframe override password:',
            hintText: 'Cipher whispered the password STARLIGHT in the corridor!',
            secretCode: 'STARLIGHT',
            maxAttempts: 3,
            unlockSceneId: sEscape,
            failSceneId: sCaught,
          },
        ],
      },
      {
        id: sEscape,
        projectId: project.id,
        name: 'Ending 1: Ghost Protocol Success',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'ch_w1', type: 'TIMER', action: 'stop', label: 'Clear', durationSeconds: 10, timeoutSceneId: sCaught },
          { id: 'ch_w2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'ch_phantom', title: 'Neon Phantom', description: 'Dodged the laser grid and cracked the vault password!', icon: '⚡' },
          { id: 'ch_w3', type: 'DIALOGUE', speaker: 'Cipher', text: 'Data downloaded and zero alarms triggered! Cleanest heist in Neo-City.' },
        ],
      },
      {
        id: sCaught,
        projectId: project.id,
        name: 'Ending 2: Laser Alarm Triggered',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'ch_l1', type: 'TIMER', action: 'stop', label: 'Clear', durationSeconds: 10, timeoutSceneId: sCaught },
          { id: 'ch_l2', type: 'DIALOGUE', speaker: 'Cipher', text: 'Blast doors sealed! Hit Restart to try the reflex jump again.' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sCorridor },
  });
}
