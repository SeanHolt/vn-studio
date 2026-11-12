import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import CreateProjectForm from '@/components/dashboard/CreateProjectForm';
import ProjectCard, { ProjectSummary } from '@/components/dashboard/ProjectCard';
import CreatorAnalyticsSummary, {
  ProjectAnalyticsRow,
} from '@/components/dashboard/CreatorAnalyticsSummary';
import { Gamepad2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { logoutUser } from '@/app/actions/auth-actions';
import UsageMeter from '@/components/dashboard/UsageMeter';
import { connection } from 'next/server';

async function ProjectGrid() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [userRecord, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { maxProjects: true, planTier: true },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { scenes: true },
        },
        purchases: {
          select: { amount: true },
        },
      },
    }),
  ]);

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-sm text-slate-400">
        <UsageMeter
          usedCount={projects.length}
          maxProjects={userRecord?.maxProjects ?? 3}
          planTier={userRecord?.planTier ?? 'FREE'}
        />
        No projects yet. Click &ldquo;New Game Project&rdquo; above to create
        your first visual novel!
      </div>
    );
  }

  const analyticsRows: ProjectAnalyticsRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    isPublished: p.isPublished,
    playCount: p.playCount,
    likesCount: p.likesCount,
    dislikesCount: p.dislikesCount,
    priceCents: p.priceCents,
    salesCount: p.purchases.length,
    earningsCents: p.purchases.reduce((sum, item) => sum + item.amount, 0),
  }));

  const summaries: ProjectSummary[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    sceneCount: p._count.scenes,
    updatedAtLabel: p.updatedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }));

  return (
    <>
      <div className="mb-6">
        <UsageMeter
          usedCount={projects.length}
          maxProjects={userRecord?.maxProjects ?? 3}
          planTier={userRecord?.planTier ?? 'FREE'}
        />
      </div>

      <CreatorAnalyticsSummary rows={analyticsRows} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const skeletonItems = Array.from({ length: 3 }, (_, idx) => idx);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                VN Studio Dashboard
              </h1>
              <p className="text-sm text-slate-400">
                Create, edit, and play interactive visual novels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreateProjectForm />
            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skeletonItems.map((n) => (
                <div
                  key={n}
                  className="h-48 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
                />
              ))}
            </div>
          }
        >
          <ProjectGrid />
        </Suspense>
      </div>
    </div>
  );
}
