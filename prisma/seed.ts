import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { STARTER_ASSETS } from '../src/lib/starter-assets';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

function getAssetUrl(id: string): string {
  return STARTER_ASSETS.find((a) => a.id === id)?.url ?? '';
}

async function main() {
  await prisma.project.deleteMany({
    where: { title: 'The Clockwork Lighthouse' },
  });

  const project = await prisma.project.create({
    data: {
      title: 'The Clockwork Lighthouse',
      description:
        'A 6-scene interactive showcase featuring variables, conditional choices, character staging, and multiple endings.',
      isPublished: true,
      variables: {
        hasBrassKey: false,
        curiosity: 0,
        keeperTrust: 1,
      },
    },
  });

  const titleSceneId = 'scene_demo_title';
  const dockSceneId = 'scene_demo_dock';
  const workshopSceneId = 'scene_demo_workshop';
  const lanternSceneId = 'scene_demo_lantern';
  const secretEndId = 'scene_demo_secret_ending';
  const standardEndId = 'scene_demo_standard_ending';
  await prisma.scene.createMany({
    data: [
      {
        id: titleSceneId,
        projectId: project.id,
        name: '0. Title Screen',
        sceneType: 'TITLE',
        order: 0,
        nodePos: { x: 50, y: 200 },
        blocks: [
          {
            id: 'blk_title_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_sunset_bay'),
            transition: 'fade',
          },
          {
            id: 'blk_title_intro',
            type: 'DIALOGUE',
            speaker: 'The Clockwork Lighthouse',
            text: 'An interactive feature showcase. Click below to begin your investigation on the coast.',
          },
          {
            id: 'blk_title_start',
            type: 'CHOICE',
            prompt: 'Ready to start?',
            options: [
              {
                id: 'opt_begin',
                label: 'Begin Chapter 1: Arrival at the Pier',
                targetSceneId: dockSceneId,
              },
            ],
          },
        ],
      },
      {
        id: dockSceneId,
        projectId: project.id,
        name: '1. Sunset Pier',
        sceneType: 'DIALOGUE',
        order: 1,
        nodePos: { x: 350, y: 200 },
        blocks: [
          {
            id: 'blk_dock_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_sunset_bay'),
            transition: 'fade',
          },
          {
            id: 'blk_dock_clara',
            type: 'CHARACTER',
            name: 'Keeper Clara',
            spriteUrl: getAssetUrl('char_mage_violet'),
            position: 'left',
            action: 'enter',
          },
          {
            id: 'blk_dock_explorer',
            type: 'CHARACTER',
            name: 'You',
            spriteUrl: getAssetUrl('char_hero_blue'),
            position: 'right',
            action: 'enter',
          },
          {
            id: 'blk_dock_line1',
            type: 'DIALOGUE',
            speaker: 'Keeper Clara',
            text: 'You arrived just before dusk. The lighthouse gears stopped turning an hour ago.',
          },
          {
            id: 'blk_dock_choice',
            type: 'CHOICE',
            prompt: 'How do you reply to Keeper Clara?',
            options: [
              {
                id: 'opt_search_woods',
                label: 'Inspect the old workshop in the woods first (+1 Curiosity)',
                targetSceneId: workshopSceneId,
              },
              {
                id: 'opt_head_up',
                label: 'Climb straight up to the Lantern Room',
                targetSceneId: lanternSceneId,
              },
            ],
          },
        ],
      },
      {
        id: workshopSceneId,
        projectId: project.id,
        name: '2. Forest Workshop',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 660, y: 60 },
        blocks: [
          {
            id: 'blk_work_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_forest_mist'),
            transition: 'fade',
          },
          {
            id: 'blk_work_exit_clara',
            type: 'CHARACTER',
            name: 'Keeper Clara',
            spriteUrl: '',
            position: 'left',
            action: 'exit',
          },
          {
            id: 'blk_work_text',
            type: 'DIALOGUE',
            speaker: 'Narrator',
            text: 'Inside the mossy workshop, you find an engraved Brass Key resting beside a blueprint!',
          },
          {
            id: 'blk_work_var1',
            type: 'SET_VARIABLE',
            variableKey: 'hasBrassKey',
            operation: 'set',
            value: true,
          },
          {
            id: 'blk_work_var2',
            type: 'SET_VARIABLE',
            variableKey: 'curiosity',
            operation: 'add',
            value: 1,
          },
          {
            id: 'blk_work_choice',
            type: 'CHOICE',
            prompt: 'With the Brass Key in hand, where to next?',
            options: [
              {
                id: 'opt_to_lantern',
                label: 'Climb to the Lantern Room',
                targetSceneId: lanternSceneId,
              },
            ],
          },
        ],
      },
      {
        id: lanternSceneId,
        projectId: project.id,
        name: '3. The Lantern Room',
        sceneType: 'DIALOGUE',
        order: 3,
        nodePos: { x: 980, y: 200 },
        blocks: [
          {
            id: 'blk_lant_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_night_sky'),
            transition: 'fade',
          },
          {
            id: 'blk_lant_clara',
            type: 'CHARACTER',
            name: 'Keeper Clara',
            spriteUrl: getAssetUrl('char_mage_violet'),
            position: 'center',
            action: 'enter',
          },
          {
            id: 'blk_lant_text',
            type: 'DIALOGUE',
            speaker: 'Keeper Clara',
            text: 'The main prism hatch is jammed shut. Without the Brass Key, we can only watch the night sky.',
          },
          {
            id: 'blk_lant_choice',
            type: 'CHOICE',
            prompt: 'Choose your action:',
            options: [
              {
                id: 'opt_secret_unlock',
                label: 'Unlock the Prism Hatch with the Brass Key (Secret Ending)',
                targetSceneId: secretEndId,
                condition: {
                  variableKey: 'hasBrassKey',
                  operator: '==',
                  value: true,
                },
              },
              {
                id: 'opt_standard_stargaze',
                label: 'Step out onto the balcony and stargaze (Standard Ending)',
                targetSceneId: standardEndId,
              },
            ],
          },
        ],
      },
      {
        id: secretEndId,
        projectId: project.id,
        name: '4A. Ending: Starlight Beacon',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1320, y: 80 },
        blocks: [
          {
            id: 'blk_end1_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_night_sky'),
            transition: 'fade',
          },
          {
            id: 'blk_end1_text',
            type: 'DIALOGUE',
            speaker: 'Narrator',
            text: 'SECRET ENDING: The Brass Key turns! The clockwork gears roar to life, projecting a silver beacon across the ocean.',
          },
        ],
      },
      {
        id: standardEndId,
        projectId: project.id,
        name: '4B. Ending: Quiet Vigil',
        sceneType: 'ENDING',
        order: 5,
        nodePos: { x: 1320, y: 320 },
        blocks: [
          {
            id: 'blk_end2_bg',
            type: 'BACKGROUND',
            assetUrl: getAssetUrl('bg_night_sky'),
            transition: 'fade',
          },
          {
            id: 'blk_end2_text',
            type: 'DIALOGUE',
            speaker: 'Narrator',
            text: 'STANDARD ENDING: You and Clara watch the constellations wheel overhead. Try replaying and inspecting the woods first!',
          },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: titleSceneId },
  });

  console.log(`Seeded extended demo "${project.title}" (ID: ${project.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
