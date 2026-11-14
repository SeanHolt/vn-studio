import { PrismaClient } from '@prisma/client';
import { CRAFTING_PRESETS } from '../src/lib/vn-crafting';

export async function seedCraftingDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: "The Alchemist's Apprentice: Potion Trial", userId: null },
  });

  const preset = CRAFTING_PRESETS.TRUE_SIGHT;

  const project = await prisma.project.create({
    data: {
      title: "The Alchemist's Apprentice: Potion Trial",
      description:
        'Discover secret bonus elixirs in your Potion Grimoire, then brew the Elixir of True Sight to reveal the hidden doorway!',
      theme: 'FANTASY',
      enableClock: false,
      isPublished: true,
      playCount: 29,
      likesCount: 18,
      dislikesCount: 0,
      variables: { potionsBrewed: 0 },
    },
  });

  const sStudy = `sc_cr_study_${project.id}`;
  const sCauldron = `sc_cr_pot_${project.id}`;
  const sHiddenDoor = `sc_cr_door_${project.id}`;
  const sWin = `sc_cr_win_${project.id}`;
  const sSmoke = `sc_cr_fail_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sStudy,
        projectId: project.id,
        name: '1. The Grand Apothecary',
        sceneType: 'DIALOGUE',
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          { id: 'cr_b1', type: 'BACKGROUND', assetUrl: 'css:alchemy-lab', transition: 'fade' },
          { id: 'cr_b2', type: 'CHARACTER', name: 'Master Aurelia', spriteUrl: 'css:char-alchemist', position: 'center', action: 'enter', emotion: 'happy', animation: 'slide-in', voiceStyle: 'MYSTIC' },
          { id: 'cr_b3', type: 'DIALOGUE', speaker: 'Master Aurelia', text: 'Check your Potion Grimoire on the right! You can discover bonus tonics for your Backpack before brewing the Elixir of True Sight!', voiceStyle: 'MYSTIC' },
          {
            id: 'cr_b4',
            type: 'CHOICE',
            prompt: 'Step up to the bubbling cauldron?',
            options: [
              { id: 'cr_o1', label: 'Open Alchemy Cauldron', targetSceneId: sCauldron },
            ],
          },
        ],
      },
      {
        id: sCauldron,
        projectId: project.id,
        name: '2. Arcane Alchemy Cauldron',
        sceneType: 'CRAFTING',
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: 'cr_p1',
            type: 'CRAFTING_PUZZLE',
            title: preset.title,
            recipePrompt: preset.recipePrompt,
            hintText: preset.hintText,
            availableIngredients: [...preset.availableIngredients],
            requiredIngredients: [...preset.requiredIngredients],
            craftedItemName: preset.craftedItemName,
            bonusRecipes: preset.bonusRecipes.map((b, idx) => ({
              ...b,
              id: `cr_bonus_${idx}`,
            })),
            maxAttempts: 5,
            successSceneId: sHiddenDoor,
            failSceneId: sSmoke,
          },
        ],
      },
      {
        id: sHiddenDoor,
        projectId: project.id,
        name: '3. The Invisible Archway',
        sceneType: 'DIALOGUE',
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          { id: 'cr_d1', type: 'SET_VARIABLE', variableKey: 'potionsBrewed', operation: 'add', value: 1 },
          { id: 'cr_d2', type: 'DIALOGUE', speaker: 'Narrator', text: 'You uncork the shimmering Elixir of True Sight from your Backpack—and an invisible archway glows open before you!' },
          { id: 'cr_d3', type: 'BRANCH', checkType: 'HAS_ITEM', itemName: 'Elixir of True Sight', trueSceneId: sWin, falseSceneId: sSmoke },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: 'Ending 1: Certified Master Alchemist',
        sceneType: 'ENDING',
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          { id: 'cr_w1', type: 'UNLOCK_ACHIEVEMENT', achievementId: 'cr_master_brewer', title: 'Master Alchemist', description: 'Brewed the Elixir of True Sight and passed Master Aurelia’s exam!', icon: '⚗️' },
          { id: 'cr_w2', type: 'DIALOGUE', speaker: 'Master Aurelia', text: 'Flawless clarity! You have earned your official Alchemist’s Seal!', voiceStyle: 'MYSTIC' },
        ],
      },
      {
        id: sSmoke,
        projectId: project.id,
        name: 'Ending 2: Soot-Covered Lab',
        sceneType: 'ENDING',
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          { id: 'cr_f1', type: 'DIALOGUE', speaker: 'Master Aurelia', text: 'Too much purple smoke! Air out the lab and hit Restart to try the formula again.', voiceStyle: 'MYSTIC' },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sStudy },
  });
}
