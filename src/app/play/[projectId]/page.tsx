import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { SceneBlockSchema, SceneType } from '@/lib/vn-schema';
import { VNThemeId } from '@/lib/vn-themes';
import VNPlayer from '@/components/player/VNPlayer';

interface PlayPageProps {
  params: Promise<{ projectId: string }>;
}

async function PlayProjectLoader({ params }: PlayPageProps) {
  const { projectId } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isSignedIn = Boolean(userId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      scenes: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project || project.scenes.length === 0) {
    notFound();
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { playCount: { increment: 1 } },
  });

  const parsedScenes = project.scenes.map((scene) => {
    const rawBlocks = Array.isArray(scene.blocks) ? scene.blocks : [];
    const validBlocks = rawBlocks
      .map((blk) => SceneBlockSchema.safeParse(blk))
      .filter((res) => res.success)
      .map((res) => res.data);

    return {
      id: scene.id,
      name: scene.name,
      sceneType: scene.sceneType as SceneType,
      order: scene.order,
      blocks: validBlocks,
    };
  });

  const initialVariables =
    project.variables &&
    typeof project.variables === 'object' &&
    !Array.isArray(project.variables)
      ? (project.variables as Record<string, string | number | boolean>)
      : {};

  const canDebug = Boolean(userId && project.userId === userId);
  const firstSceneId = parsedScenes.at(0)?.id ?? '';

  return (
    <VNPlayer
      projectId={project.id}
      title={project.title}
      theme={(project.theme as VNThemeId) || 'MODERN'}
      enableClock={project.enableClock}
      canDebug={canDebug}
      isSignedIn={isSignedIn}
      startSceneId={project.startSceneId ?? firstSceneId}
      initialVariables={initialVariables}
      scenes={parsedScenes}
    />
  );
}

export default function PlayProjectPage({ params }: PlayPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading adventure stage...
        </div>
      }
    >
      <PlayProjectLoader params={params} />
    </Suspense>
  );
}
