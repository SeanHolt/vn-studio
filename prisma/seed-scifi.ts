import { PrismaClient } from '@prisma/client';
import { buildPresetQuestions } from '../src/lib/vn-trivia-presets';

export async function seedSciFiEscapeDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: 'Starship Orion: Escape Protocol', userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Starship Orion: Escape Protocol',
      description:
        'Beat the 30-second reactor countdown! Crack the airlock PIN code and pass the AI security trivia to launch the escape pod.',
      theme: 'SCIFI',
      enableClock: false,
      isPublished: true,
      variables: { securityLevel: 1 },
    },
  });

  const sBridge = `sc_sf_bridge_${project.id}`;
  const sKeypad = `sc_sf_keypad_${project.id}`;
  const sTrivia = `sc_sf_trivia_${project.id}`;
  const sVictory = `sc_sf_win_${project.id}`;
  const sTimeout = `sc_sf_fail_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sBridge,
        projectId: project.id,
        name: '1. Red Alert on Bridge',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'sf_b1', type: 'BACKGROUND', assetUrl: 'css:starship-bridge', transition: 'fade' },
          { id: 'sf_b2', type: 'PLAY_AUDIO', audioType: 'SFX', soundUrl: 'synth:alert', loop: false, action: 'play' },
          { id: 'sf_fx1', type: 'CAMERA_FX', effect: 'FLASH_RED', intensity: 'STRONG' },
          { id: 'sf_fx2', type: 'CAMERA_FX', effect: 'SHAKE', intensity: 'STRONG' },
          { id: 'sf_b3', type: 'CHARACTER', name: 'A.I. Unit VEX', spriteUrl: 'css:char-cyborg', position: 'center', action: 'enter', emotion: 'shocked', animation: 'shake' },
          { id: 'sf_b4', type: 'DIALOGUE', speaker: 'A.I. Unit VEX', text: 'WARNING: Hull breach detected! Bulkhead override PIN is 1984. You have 30 seconds!' },
          { id: 'sf_b5', type: 'TIMER', action: 'start', label: 'Reactor Overload', durationSeconds: 30, timeoutSceneId: sTimeout },
          {
            id: 'sf_b6',
            type: 'CHOICE',
            prompt: 'Select emergency protocol:',
            options: [
              { id: 'sf_o1', label: 'Enter Airlock PIN Keypad (1984)', targetSceneId: sKeypad },
              { id: 'sf_o2', label: 'Bypass via Mainframe Trivia Lock', targetSceneId: sTrivia },
            ],
          },
        ],
      },
      {
        id: sKeypad,
        projectId: project.id,
        name: '2. Airlock Keypad Lock',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 380, y: 60 },
        blocks: [
          {
            id: 'sf_k1',
            type: 'KEYPAD_PUZZLE',
            lockMode: 'PIN',
            promptText: 'Enter the 4-digit bulkhead override PIN:',
            hintText: 'VEX mentioned the year 1984 on the bridge!',
            secretCode: '1984',
            maxAttempts: 3,
            unlockSceneId: sTrivia,
            failSceneId: sTimeout,
          },
        ],
      },
      {
        id: sTrivia,
        projectId: project.id,
        name: '3. AI Sci-Fi Verification',
        sceneType: 'QUIZ',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: 'sf_q1',
            type: 'QUIZ_CHALLENGE',
            title: 'Orion AI Human Verification',
            passingScore: 3,
            questions: buildPresetQuestions('SCIFI_MOVIES'),
            passSceneId: sVictory,
            failSceneId: sTimeout,
          },
        ],
      },
      {
        id: sVictory,
        projectId: project.id,
        name: 'Ending 1: Escape Pod Launched',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'sf_w1', type: 'TIMER', action: 'stop', label: 'Clear', durationSeconds: 10, timeoutSceneId: sTimeout },
          { id: 'sf_w2', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'sf_survivor', title: 'Starship Survivor', description: 'Cracked the PIN and passed the Sci-Fi AI trial before overload!', icon: '🚀' },
          { id: 'sf_w3', type: 'DIALOGUE', speaker: 'A.I. Unit VEX', text: 'Verification complete. Escape pod launched safely into orbit!' },
        ],
      },
      {
        id: sTimeout,
        projectId: project.id,
        name: 'Ending 2: Containment Lockout',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'sf_f1', type: 'TIMER', action: 'stop', label: 'Clear', durationSeconds: 10, timeoutSceneId: sTimeout },
          { id: 'sf_f2', type: 'DIALOGUE', speaker: 'A.I. Unit VEX', text: 'Security lockout engaged. Restart the simulation to try again!' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sBridge },
  });
}
