import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { seedLighthouseDemo } from './seed-lighthouse';
import { seedSciFiEscapeDemo } from './seed-scifi';
import { seedFantasyRpgDemo } from './seed-fantasy';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedLighthouseDemo(prisma);
  await seedSciFiEscapeDemo(prisma);
  await seedFantasyRpgDemo(prisma);
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
