import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ArcadeBrowser, {
  ArcadeProjectCard,
} from '@/components/arcade/ArcadeBrowser';
import { Gamepad2, Sparkles } from 'lucide-react';

async function ArcadeLoader() {
  await connection();
  const [session, rawProjects] = await Promise.all([
    auth(),
    prisma.project.findMany({
      where: {
        OR: [{ userId: null }, { isPublished: true }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true } },
        scenes: { select: { sceneType: true } },
      },
    }),
  ]);

  const viewerId = session?.user?.id;
  const purchasedIds = new Set(['']);

  if (viewerId) {
    const purchases = await prisma.gamePurchase.findMany({
      where: { userId: viewerId },
      select: { projectId: true },
    });
    purchases.forEach((p) => purchasedIds.add(p.projectId));
  }

  const cards: ArcadeProjectCard[] = rawProjects.map((proj) => {
    const types = new Set(proj.scenes.map((s) => s.sceneType));
    const genres: string[] = [];
    if (types.has('HOTSPOT')) genres.push('SANDBOX');
    if (types.has('TOPDOWN')) genres.push('TOPDOWN');
    if (types.has('BATTLE')) genres.push('BATTLE');
    if (types.has('QUIZ')) genres.push('QUIZ');
    if (genres.length === 0 || types.has('DIALOGUE')) {
      genres.unshift('VISUAL_NOVEL');
    }

    const isOwned =
      Boolean(viewerId && proj.userId === viewerId) ||
      purchasedIds.has(proj.id);

    return {
      id: proj.id,
      title: proj.title,
      description: proj.description,
      authorName:
        proj.userId === null
          ? 'VN Studio Official'
          : proj.user?.name || 'Creator',
      isDemo: proj.userId === null && proj.title === 'The Clockwork Lighthouse',
      sceneCount: proj.scenes.length,
      genres,
      theme: proj.theme,
      playCount: proj.playCount,
      likesCount: proj.likesCount,
      allowRemix: proj.allowRemix,
      priceCents: proj.priceCents,
      isOwnedByViewer: isOwned,
    };
  });

  return (
    <ArcadeBrowser
      projects={cards}
      isLoggedIn={Boolean(viewerId)}
    />
  );
}

export default function ExploreArcadePage() {
  const skeletons = Array.from({ length: 3 }, (_, idx) => idx);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <span>VN Studio</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              My Studio
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Community Arcade
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Explore &amp; Remix Community Games
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Play interactive visual novels, escape rooms, 2D RPGs, and battles
            made by creators—or click Remix to clone any game into your own
            studio.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skeletons.map((n) => (
                <div
                  key={n}
                  className="h-60 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50"
                />
              ))}
            </div>
          }
        >
          <ArcadeLoader />
        </Suspense>
      </div>
    </div>
  );
}
