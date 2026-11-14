'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const SAVE_TTL_DAYS = 30;

export interface AutoSavePayload {
  sceneName: string;
  savedAtMs: number;
  stateJson: Record<string, unknown>;
}

export async function pruneExpiredAutoSaves() {
  const cutoff = new Date(Date.now() - SAVE_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.playerAutoSave.deleteMany({
    where: { lastAccessedAt: { lt: cutoff } },
  });
}

export async function loadDbAutoSaveSlot0(
  projectId: string
): Promise<AutoSavePayload | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  await pruneExpiredAutoSaves();

  const row = await prisma.playerAutoSave.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (!row) return null;

  await prisma.playerAutoSave.update({
    where: { id: row.id },
    data: { lastAccessedAt: new Date() },
  });

  return {
    sceneName: row.sceneName,
    savedAtMs: Number(row.savedAtMs),
    stateJson: row.stateJson as Record<string, unknown>,
  };
}

export async function saveDbAutoSaveSlot0(params: {
  projectId: string;
  sceneName: string;
  savedAtMs: number;
  stateJson: Record<string, unknown>;
}): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return false;

  await prisma.playerAutoSave.upsert({
    where: {
      projectId_userId: {
        projectId: params.projectId,
        userId,
      },
    },
    update: {
      sceneName: params.sceneName,
      savedAtMs: BigInt(params.savedAtMs),
      stateJson: params.stateJson as object,
      lastAccessedAt: new Date(),
    },
    create: {
      projectId: params.projectId,
      userId,
      sceneName: params.sceneName,
      savedAtMs: BigInt(params.savedAtMs),
      stateJson: params.stateJson as object,
    },
  });

  return true;
}

export async function clearDbAutoSaveSlot0(projectId: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await prisma.playerAutoSave.deleteMany({
    where: { projectId, userId },
  });
}
