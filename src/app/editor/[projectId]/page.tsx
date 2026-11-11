import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import SimpleEditorWorkspace from '@/components/editor/SimpleEditorWorkspace';
import { ScenePayload } from '@/app/actions/editor-actions';
import { ProjectAsset } from '@/app/actions/asset-actions';
import { SceneBlock, SceneType } from '@/lib/vn-schema';
import { GameVariables } from '@/lib/vn-engine';
import { VNThemeId } from '@/lib/vn-themes';

interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

async function EditorLoader({ params }: EditorPageProps) {
  await connection();
  const { projectId } = await params;

  const project =
    projectId === 'demo'
      ? await prisma.project.findFirst({
          where: { title: 'The Clockwork Lighthouse', userId: null },
          include: {
            scenes: { orderBy: { order: 'asc' } },
            assets: { orderBy: { createdAt: 'desc' } },
          },
        })
      : await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            scenes: { orderBy: { order: 'asc' } },
            assets: { orderBy: { createdAt: 'desc' } },
          },
        });

  if (!project) {
    notFound();
  }

  if (project.userId) {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (session.user.id !== project.userId) {
      redirect('/dashboard');
    }
  }

  const initialScenes: ScenePayload[] = project.scenes.map((s) => ({
    id: s.id,
    name: s.name,
    sceneType: s.sceneType as SceneType,
    order: s.order,
    blocks: s.blocks as unknown as SceneBlock[],
    nodePos: (s.nodePos as { x: number; y: number }) || { x: s.order * 320, y: 150 },
  }));

  const initialAssets: ProjectAsset[] = project.assets.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category as 'IMAGE' | 'AUDIO',
    url: a.url,
  }));

  return (
    <SimpleEditorWorkspace
      projectId={project.id}
      projectTitle={project.title}
      initialScenes={initialScenes}
      initialVariables={(project.variables as GameVariables) || {}}
      initialIsPublished={project.isPublished}
      isDemo={project.userId === null}
      initialTheme={(project.theme as VNThemeId) || 'MODERN'}
      initialEnableClock={project.enableClock}
      initialAssets={initialAssets}
    />
  );
}

export default function EditorPage({ params }: EditorPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading VN Studio...
        </div>
      }
    >
      <EditorLoader params={params} />
    </Suspense>
  );
}
