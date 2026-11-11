'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function likeArcadeGame(
  projectId: string
): Promise<{ likesCount: number }> {
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { likesCount: { increment: 1 } },
    select: { likesCount: true },
  });

  revalidatePath('/explore');
  return { likesCount: updated.likesCount };
}

export async function recordGamePlay(projectId: string): Promise<void> {
  await prisma.project.update({
    where: { id: projectId },
    data: { playCount: { increment: 1 } },
  });
}

export async function updateProjectDistribution(
  projectId: string,
  allowRemix: boolean,
  priceCents: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id) {
    return { success: false, error: 'You do not own this project.' };
  }

  const safePrice = Math.max(0, Math.min(9900, Math.round(priceCents)));

  await prisma.project.update({
    where: { id: projectId },
    data: {
      allowRemix,
      priceCents: safePrice,
    },
  });

  revalidatePath('/explore');
  revalidatePath(`/editor/${projectId}`);
  return { success: true };
}
