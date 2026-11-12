"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SceneBlock } from "@/lib/vn-schema";

function remapBlockSceneIds(
  blocks: SceneBlock[],
  idMap: Map<string, string>,
): SceneBlock[] {
  return blocks.map((blk) => {
    const newId = `blk_${crypto.randomUUID()}`;
    if (blk.type === "CHOICE") {
      return {
        ...blk,
        id: newId,
        options: blk.options.map((opt) => ({
          ...opt,
          id: `opt_${crypto.randomUUID()}`,
          targetSceneId: idMap.get(opt.targetSceneId) ?? opt.targetSceneId,
        })),
      };
    }
    if (blk.type === "BRANCH") {
      return {
        ...blk,
        id: newId,
        trueSceneId: idMap.get(blk.trueSceneId) ?? blk.trueSceneId,
        falseSceneId: idMap.get(blk.falseSceneId) ?? blk.falseSceneId,
      };
    }
    if (blk.type === "TIMER") {
      return {
        ...blk,
        id: newId,
        timeoutSceneId: idMap.get(blk.timeoutSceneId) ?? blk.timeoutSceneId,
      };
    }
    if (blk.type === "HOTSPOT_ROOM") {
      return {
        ...blk,
        id: newId,
        hotspots: blk.hotspots.map((hz) => ({
          ...hz,
          id: `hz_${crypto.randomUUID()}`,
          targetSceneId: hz.targetSceneId
            ? (idMap.get(hz.targetSceneId) ?? hz.targetSceneId)
            : undefined,
        })),
      };
    }
    if (blk.type === "TOPDOWN_ROOM") {
      return {
        ...blk,
        id: newId,
        entities: blk.entities.map((ent) => ({
          ...ent,
          id: `td_${crypto.randomUUID()}`,
          targetSceneId: ent.targetSceneId
            ? (idMap.get(ent.targetSceneId) ?? ent.targetSceneId)
            : undefined,
        })),
      };
    }
    if (blk.type === "BATTLE_ENCOUNTER") {
      return {
        ...blk,
        id: newId,
        victorySceneId: idMap.get(blk.victorySceneId) ?? blk.victorySceneId,
        defeatSceneId: idMap.get(blk.defeatSceneId) ?? blk.defeatSceneId,
      };
    }
    if (blk.type === "QUIZ_CHALLENGE") {
      return {
        ...blk,
        id: newId,
        passSceneId: idMap.get(blk.passSceneId) ?? blk.passSceneId,
        failSceneId: idMap.get(blk.failSceneId) ?? blk.failSceneId,
      };
    }
    if (blk.type === "QTE_ACTION") {
      return {
        ...blk,
        id: newId,
        successSceneId: idMap.get(blk.successSceneId) ?? blk.successSceneId,
        failSceneId: idMap.get(blk.failSceneId) ?? blk.failSceneId,
      };
    }
    return { ...blk, id: newId };
  });
}

export async function remixProject(sourceProjectId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { projects: true } } },
  });

  if (!user) {
    redirect("/login");
  }

  if (user._count.projects >= user.maxProjects) {
    redirect("/pricing?reason=limit_reached");
  }

  const source = await prisma.project.findUnique({
    where: { id: sourceProjectId },
    include: {
      scenes: { orderBy: { order: "asc" } },
      assets: true,
    },
  });

  if (!source || (!source.isPublished && source.userId !== null)) {
    redirect("/explore");
  }
  if (!source.allowRemix) {
    redirect("/explore?error=remix_disabled");
  }
  const sceneIdMap = new Map<string, string>();
  source.scenes.forEach((sc) => {
    sceneIdMap.set(sc.id, `sc_${crypto.randomUUID()}`);
  });

  const remappedStartId = source.startSceneId
    ? (sceneIdMap.get(source.startSceneId) ?? null)
    : null;

  const created = await prisma.project.create({
    data: {
      userId: user.id,
      title: `${source.title} (Remix)`,
      description: source.description,
      theme: source.theme,
      enableClock: source.enableClock,
      isPublished: false,
      startSceneId: remappedStartId,
      variables: source.variables as object,
      scenes: {
        create: source.scenes.map((sc) => ({
          id: sceneIdMap.get(sc.id)!,
          name: sc.name,
          sceneType: sc.sceneType,
          order: sc.order,
          nodePos: sc.nodePos as object,
          blocks: remapBlockSceneIds(
            sc.blocks as unknown as SceneBlock[],
            sceneIdMap,
          ) as unknown as object,
        })),
      },
      assets: {
        create: source.assets.map((ast) => ({
          name: ast.name,
          category: ast.category,
          url: ast.url,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/editor/${created.id}`);
}
