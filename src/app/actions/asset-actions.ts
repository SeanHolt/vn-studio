'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface ProjectAsset {
  id: string;
  name: string;
  category: 'IMAGE' | 'AUDIO';
  url: string;
}

export async function renameProjectAsset(
  assetId: string,
  newName: string,
  projectId: string
): Promise<{ success: boolean }> {
  const cleanName = newName.trim().slice(0, 40);
  if (!cleanName) return { success: false };

  await prisma.asset.update({
    where: { id: assetId },
    data: { name: cleanName },
  });

  revalidatePath(`/editor/${projectId}`);
  return { success: true };
}

export async function deleteProjectAsset(
  assetId: string,
  projectId: string
): Promise<{ success: boolean }> {
  await prisma.asset.delete({
    where: { id: assetId },
  });

  revalidatePath(`/editor/${projectId}`);
  return { success: true };
}
