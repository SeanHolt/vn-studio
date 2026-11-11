import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import VNPlayer, { PlayableScene } from '@/components/player/VNPlayer';
import PaidGameGate from '@/components/player/PaidGameGate';
import { SceneBlock, SceneType } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';

interface PlayPageProps {
  params: Promise<{ projectId: string }>;
}

async function PlayerLoader({ params }: PlayPageProps) {
  await connection();
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

  if (project.priceCents > 0) {
    const session = await auth();
    const userId = session?.user?.id;
    const isOwner = Boolean(userId && project.userId === userId);

    let hasPurchased = false;
    if (userId && !isOwner) {
      const purchase = await prisma.gamePurchase.findUnique({
        where: {
          userId_projectId: { userId, projectId: project.id },
        },
      });
      hasPurchased = Boolean(purchase);
    }

    if (!isOwner && !hasPurchased) {
      return (
        <PaidGameGate
          projectId={project.id}
          title={project.title}
          description={project.description}
          priceCents={project.priceCents}
          isLoggedIn={Boolean(userId)}
        />
      );
    }
  }

  await prisma.project.update({
    where: { id: project.id },
    data: { playCount: { increment: 1 } },
  });

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
