import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { seedLighthouseDemo } from './seed-lighthouse';
import { seedSciFiEscapeDemo } from './seed-scifi';
import { seedFantasyRpgDemo } from './seed-fantasy';
import { seedCardDuelDemo } from './seed-card-duel';
import { seedCyberHeistDemo } from './seed-cyber-heist';
import { seedCircuitPuzzleDemo } from './seed-circuit';
import { seedIdleTycoonDemo } from './seed-idle';
import { seedSlidingPuzzleDemo } from './seed-sliding';
import { seedCraftingDemo } from './seed-crafting';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedLighthouseDemo(prisma);
  await seedSciFiEscapeDemo(prisma);
  await seedFantasyRpgDemo(prisma);
  await seedCardDuelDemo(prisma);
  await seedCyberHeistDemo(prisma);
  await seedCircuitPuzzleDemo(prisma);
  await seedIdleTycoonDemo(prisma);
  await seedSlidingPuzzleDemo(prisma);
  await seedCraftingDemo(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
