'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export type VoteChoice = 'LIKE' | 'DISLIKE' | 'NONE';

export async function voteArcadeGame(
  projectId: string,
  prevVote: VoteChoice,
  nextVote: VoteChoice
): Promise<{ likesCount: number; dislikesCount: number }> {
  let likeDelta = 0;
  let dislikeDelta = 0;

  if (prevVote === 'LIKE') likeDelta -= 1;
  if (prevVote === 'DISLIKE') dislikeDelta -= 1;
  if (nextVote === 'LIKE') likeDelta += 1;
  if (nextVote === 'DISLIKE') dislikeDelta += 1;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      likesCount: { increment: likeDelta },
      dislikesCount: { increment: dislikeDelta },
    },
    select: { likesCount: true, dislikesCount: true },
  });

  revalidatePath('/explore');
  return {
    likesCount: Math.max(0, updated.likesCount),
    dislikesCount: Math.max(0, updated.dislikesCount),
  };
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
