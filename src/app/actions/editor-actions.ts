"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SceneBlock, SceneType } from "@/lib/vn-schema";
import { GameVariables } from "@/lib/vn-engine";
import { VNThemeId } from "@/lib/vn-themes";

export interface ScenePayload {
  id: string;
  name: string;
  sceneType: SceneType;
  order: number;
  blocks: SceneBlock[];
  nodePos: { x: number; y: number };
}

export async function saveProjectScenes(
  projectId: string,
  scenes: ScenePayload[],
  variables: GameVariables,
  theme: VNThemeId = "MODERN",
  enableClock: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Verify ownership if this project belongs to a user account
  if (project.userId) {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== project.userId) {
      return {
        success: false,
        error: "Unauthorized: You do not own this project.",
      };
    }
  }

  const keepIds = scenes.map((s) => s.id);

  await prisma.$transaction([
    prisma.scene.deleteMany({
      where: { projectId, id: { notIn: keepIds } },
    }),
    ...scenes.map((scene, index) =>
      prisma.scene.upsert({
        where: { id: scene.id },
        update: {
          name: scene.name,
          sceneType: scene.sceneType,
          order: index,
          blocks: scene.blocks as unknown as object,
          nodePos: scene.nodePos as unknown as object,
        },
        create: {
          id: scene.id,
          projectId,
          name: scene.name,
          sceneType: scene.sceneType,
          order: index,
          blocks: scene.blocks as unknown as object,
          nodePos: scene.nodePos as unknown as object,
        },
      }),
    ),
    prisma.project.update({
      where: { id: projectId },
      data: {
        startSceneId: scenes.at(0)?.id ?? null,
        variables: variables as unknown as object,
        theme,
        enableClock,
      },
    }),
  ]);

  revalidatePath(`/editor/${projectId}`);
  revalidatePath(`/play/${projectId}`);
  return { success: true };
}

export async function toggleProjectPublish(
  projectId: string,
  nextPublishedState: boolean,
): Promise<{ success: boolean; isPublished?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to publish a project.",
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project || project.userId !== session.user.id) {
    return {
      success: false,
      error: "Unauthorized: You do not own this project.",
    };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { isPublished: nextPublishedState },
    select: { isPublished: true },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/editor/${projectId}`);

  return { success: true, isPublished: updated.isPublished };
}
