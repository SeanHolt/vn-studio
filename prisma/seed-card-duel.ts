import { PrismaClient } from "@prisma/client";
import { buildPresetQuestions } from "../src/lib/vn-trivia-presets";

export async function seedCardDuelDemo(prisma: PrismaClient) {
  await prisma.project.deleteMany({
    where: { title: "Arcane Duelists: Academy of Cards", userId: null },
  });

  const project = await prisma.project.create({
    data: {
      title: "Arcane Duelists: Academy of Cards",
      description:
        "Challenge Archmage Lyra to a multi-round Elemental Card Showdown with Mana Ultimate Surges, then solve the Sphinx’s 5 ancient riddles!",
      theme: "ARCADE",
      enableClock: false,
      isPublished: true,
      playCount: 42,
      likesCount: 19,
      dislikesCount: 1,
      variables: { duelScore: 0 },
    },
  });

  const sHall = `sc_cd_hall_${project.id}`;
  const sDuel = `sc_cd_duel_${project.id}`;
  const sRiddles = `sc_cd_rid_${project.id}`;
  const sWin = `sc_cd_win_${project.id}`;
  const sLose = `sc_cd_lose_${project.id}`;

  await prisma.scene.createMany({
    data: [
      {
        id: sHall,
        projectId: project.id,
        name: "1. Grand Dueling Hall",
        sceneType: "DIALOGUE",
        order: 0,
        nodePos: { x: 40, y: 180 },
        blocks: [
          {
            id: "cd_b1",
            type: "BACKGROUND",
            assetUrl: "css:royal-throne",
            transition: "fade",
          },
          {
            id: "cd_b2",
            type: "CHARACTER",
            name: "Archmage Lyra",
            spriteUrl: "css:char-keeper",
            position: "center",
            action: "enter",
            emotion: "happy",
            animation: "slide-in",
            voiceStyle: "MYSTIC",
          },
          {
            id: "cd_b3",
            type: "DIALOGUE",
            speaker: "Archmage Lyra",
            text: "Welcome to the Academy! Play 2 cards to charge your Astral Overdrive (+4 Power) and defeat me in our Elemental Card Duel!",
            voiceStyle: "MYSTIC",
          },
          {
            id: "cd_b4",
            type: "CHOICE",
            prompt: "Accept Archmage Lyra’s challenge?",
            options: [
              {
                id: "cd_o1",
                label: "Start Elemental Card Duel",
                targetSceneId: sDuel,
              },
            ],
          },
        ],
      },
      {
        id: sDuel,
        projectId: project.id,
        name: "2. Elemental Card Showdown",
        sceneType: "DIALOGUE",
        order: 1,
        nodePos: { x: 380, y: 180 },
        blocks: [
          {
            id: "cd_d1",
            type: "CARD_DUEL",
            title: "Academy Entrance Duel",
            opponentName: "Archmage Lyra",
            deckTheme: "ELEMENTAL",
            customCards: [],
            enableManaUltimate: true,
            ultimateName: "Astral Overdrive",
            roundsToWin: 2,
            victorySceneId: sRiddles,
            defeatSceneId: sLose,
          },
        ],
      },
      {
        id: sRiddles,
        projectId: project.id,
        name: "3. Trial of the Sphinx",
        sceneType: "QUIZ",
        order: 2,
        nodePos: { x: 720, y: 180 },
        blocks: [
          {
            id: "cd_q1",
            type: "QUIZ_CHALLENGE",
            title: "5 Riddles of the Ancient Sphinx",
            passingScore: 3,
            questions: buildPresetQuestions("RIDDLES"),
            passSceneId: sWin,
            failSceneId: sLose,
          },
        ],
      },
      {
        id: sWin,
        projectId: project.id,
        name: "Ending 1: Grand Duelist",
        sceneType: "ENDING",
        order: 3,
        nodePos: { x: 1060, y: 80 },
        blocks: [
          {
            id: "cd_w1",
            type: "UNLOCK_ACHIEVEMENT",
            achievementId: "cd_grand_duelist",
            title: "Grand Duelist",
            description:
              "Won the Elemental Card Duel and passed the Sphinx’s Riddles!",
            icon: "🃏",
          },
          {
            id: "cd_w2",
            type: "DIALOGUE",
            speaker: "Archmage Lyra",
            text: "Brilliant strategy! You are officially inducted into the Arcane Duelists Guild!",
            voiceStyle: "MYSTIC",
          },
        ],
      },
      {
        id: sLose,
        projectId: project.id,
        name: "Ending 2: Outplayed",
        sceneType: "ENDING",
        order: 4,
        nodePos: { x: 1060, y: 290 },
        blocks: [
          {
            id: "cd_f1",
            type: "DIALOGUE",
            speaker: "Archmage Lyra",
            text: "A valiant effort! Hit Restart to shuffle your deck and try again.",
            voiceStyle: "MYSTIC",
          },
        ],
      },
    ],
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { startSceneId: sHall },
  });
}
