import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VNPlayer, { PlayableScene } from '@/components/player/VNPlayer';
import { SceneBlock, SceneType } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';

interface PlayPageProps {
  params: Promise<{ projectId: string }>;
}

async function PlayerLoader({ params }: PlayPageProps) {
  const { projectId } = await params;

  const project =
    projectId === 'demo'
      ? await prisma.project.findFirst({
          where: { title: 'The Clockwork Lighthouse' },
          include: { scenes: { orderBy: { order: 'asc' } } },
        })
      : await prisma.project.findUnique({
          where: { id: projectId },
          include: { scenes: { orderBy: { order: 'asc' } } },
        });

  if (!project || !project.startSceneId) {
    notFound();
  }

  const playableScenes: PlayableScene[] = project.scenes.map((scene) => ({
    id: scene.id,
    name: scene.name,
    sceneType: scene.sceneType as SceneType,
    blocks: scene.blocks as unknown as SceneBlock[],
  }));

  return (
    <VNPlayer
      projectId={project.id}
      title={project.title}
      startSceneId={project.startSceneId}
      initialVariables={(project.variables as GameVariables) || {}}
      scenes={playableScenes}
      theme={project.theme}
      enableClock={project.enableClock}
    />
  );
}

export default function PlayPage({ params }: PlayPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading Game...
        </div>
      }
    >
      <PlayerLoader params={params} />
    </Suspense>
  );
}
