import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Play, Edit3, Layers } from 'lucide-react';

export default async function FeaturedGames() {
  await connection();

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { userId: null },
        { isPublished: true },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: 3,
    include: {
      _count: {
        select: { scenes: true },
      },
    },
  });

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
        No public games available yet. Head to the Dashboard to build your first story!
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {projects.map((project) => {
        const isPublicDemo = project.userId === null;
        const playHref = isPublicDemo ? '/play/demo' : `/play/${project.id}`;
        const editHref = isPublicDemo ? '/editor/demo' : `/editor/${project.id}`;

        return (
          <div
            key={project.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg transition hover:border-indigo-500/50"
          >
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                <span className="rounded-full border border-indigo-500/30 bg-indigo-950 px-2.5 py-0.5 font-medium text-indigo-300">
                  {isPublicDemo ? 'Interactive Demo' : 'Community Game'}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> {project._count.scenes} scenes
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{project.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {project.description || 'An interactive story built in VN Studio.'}
              </p>
            </div>

            <div className={`mt-6 grid gap-2.5 ${isPublicDemo ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Link
                href={playHref}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                <Play className="h-3.5 w-3.5" /> Play Now
              </Link>

              {isPublicDemo && (
                <Link
                  href={editHref}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Open Demo Editor
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
