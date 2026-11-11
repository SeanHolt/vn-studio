'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function createProject(
  title: string,
  description: string,
  template: 'BLANK' | 'MYSTERY_STARTER'
): Promise<void> {
  const cleanTitle = title.trim() || 'Untitled Visual Novel';
  const startSceneId = `scene_${crypto.randomUUID()}`;
  const endingSceneId = `scene_${crypto.randomUUID()}`;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { projects: true } } },
  });

  if (!user) {
    redirect('/login');
  }
  if (user._count.projects >= user.maxProjects) {
    redirect('/pricing?reason=limit_reached');
  }
  const project = await prisma.project.create({
    data: {
      title: cleanTitle,
      description: description.trim() || null,
      isPublished: false,
      variables: template === 'MYSTERY_STARTER' ? { hasClue: false } : {},
      startSceneId,
      userId: user.id,
      scenes: {
        create:
          template === 'MYSTERY_STARTER'
            ? [
                {
                  id: startSceneId,
                  name: '1. Opening Scene',
                  sceneType: 'DIALOGUE',
                  order: 0,
                  nodePos: { x: 100, y: 150 },
                  blocks: [
                    {
                      id: `blk_${crypto.randomUUID()}`,
                      type: 'DIALOGUE',
                      speaker: 'Narrator',
                      text: 'Your adventure starts here. Click Edit to customize this scene!',
                    },
                    {
                      id: `blk_${crypto.randomUUID()}`,
                      type: 'CHOICE',
                      prompt: 'Where will you go?',
                      options: [
                        {
                          id: `opt_${crypto.randomUUID()}`,
                          label: 'Continue to the ending',
                          targetSceneId: endingSceneId,
                        },
                      ],
                    },
                  ],
                },
                {
                  id: endingSceneId,
                  name: '2. Finale',
                  sceneType: 'ENDING',
                  order: 1,
                  nodePos: { x: 450, y: 150 },
                  blocks: [
                    {
                      id: `blk_${crypto.randomUUID()}`,
                      type: 'DIALOGUE',
                      speaker: 'Narrator',
                      text: 'You reached the end of the starter template!',
                    },
                  ],
                },
              ]
            : [
                {
                  id: startSceneId,
                  name: 'Scene 1',
                  sceneType: 'DIALOGUE',
                  order: 0,
                  nodePos: { x: 100, y: 150 },
                  blocks: [
                    {
                      id: `blk_${crypto.randomUUID()}`,
                      type: 'DIALOGUE',
                      speaker: 'Narrator',
                      text: 'Once upon a time...',
                    },
                  ],
                },
              ],
      },
    },
  });

  revalidatePath('/dashboard');
  redirect(`/editor/${project.id}`);
}

export async function deleteProject(projectId: string): Promise<void> {
  await prisma.project.delete({
    where: { id: projectId },
  });
  revalidatePath('/dashboard');
}
