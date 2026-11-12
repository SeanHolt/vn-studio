import { ScenePayload } from '@/app/actions/editor-actions';
import { SceneBlock } from './vn-schema';

export interface ValidationIssue {
  id: string;
  severity: 'ERROR' | 'WARNING';
  sceneId: string;
  sceneName: string;
  blockId?: string;
  message: string;
}

function extractOutgoingSceneIds(block: SceneBlock): string[] {
  const targets: string[] = [];

  if (block.type === 'CHOICE') {
    block.options.forEach((opt) => {
      if (opt.targetSceneId) targets.push(opt.targetSceneId);
    });
  } else if (block.type === 'BRANCH') {
    if (block.trueSceneId) targets.push(block.trueSceneId);
    if (block.falseSceneId) targets.push(block.falseSceneId);
  } else if (block.type === 'TIMER') {
    if (block.action === 'start' && block.timeoutSceneId) {
      targets.push(block.timeoutSceneId);
    }
  } else if (block.type === 'HOTSPOT_ROOM') {
    block.hotspots.forEach((hz) => {
      if (hz.actionType === 'JUMP_SCENE' && hz.targetSceneId) {
        targets.push(hz.targetSceneId);
      }
    });
  } else if (block.type === 'TOPDOWN_ROOM') {
    block.entities.forEach((ent) => {
      if (ent.targetSceneId) targets.push(ent.targetSceneId);
    });
  } else if (block.type === 'BATTLE_ENCOUNTER') {
    if (block.victorySceneId) targets.push(block.victorySceneId);
    if (block.defeatSceneId) targets.push(block.defeatSceneId);
  } else if (block.type === 'KEYPAD_PUZZLE') {
    if (block.unlockSceneId) targets.push(block.unlockSceneId);
    if (block.failSceneId) targets.push(block.failSceneId);
  } else if (block.type === 'QUIZ_CHALLENGE') {
    if (block.passSceneId) targets.push(block.passSceneId);
    if (block.failSceneId) targets.push(block.failSceneId);
  } else if (block.type === 'QTE_ACTION') {
    if (block.successSceneId) targets.push(block.successSceneId);
    if (block.failSceneId) targets.push(block.failSceneId);
  } else if (block.type === 'CARD_DUEL') {
    if (block.victorySceneId) targets.push(block.victorySceneId);
    if (block.defeatSceneId) targets.push(block.defeatSceneId);
  }

  return targets;
}

export function validateProjectStory(
  scenes: ScenePayload[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (scenes.length === 0) return issues;

  const validIds = new Set(scenes.map((s) => s.id));
  const incomingLinks = new Set<string>();
  const startScene = scenes.at(0);
  if (startScene) incomingLinks.add(startScene.id);

  scenes.forEach((scene) => {
    if (scene.blocks.length === 0) {
      issues.push({
        id: `empty_${scene.id}`,
        severity: 'WARNING',
        sceneId: scene.id,
        sceneName: scene.name,
        message: 'Scene has no blocks yet.',
      });
    }

    let hasValidExit = false;

    scene.blocks.forEach((block) => {
      if (block.type === 'CHOICE' && block.options.length === 0) {
        issues.push({
          id: `empty_choice_${block.id}`,
          severity: 'ERROR',
          sceneId: scene.id,
          sceneName: scene.name,
          blockId: block.id,
          message: 'Choice block has zero selectable options.',
        });
      }

      const targets = extractOutgoingSceneIds(block);
      targets.forEach((targetId) => {
        if (!validIds.has(targetId)) {
          issues.push({
            id: `broken_${block.id}_${targetId}`,
            severity: 'ERROR',
            sceneId: scene.id,
            sceneName: scene.name,
            blockId: block.id,
            message: `Block "${block.type}" points to a deleted or missing scene.`,
          });
        } else {
          hasValidExit = true;
          incomingLinks.add(targetId);
        }
      });
    });

    if (scene.sceneType !== 'ENDING' && !hasValidExit) {
      issues.push({
        id: `deadend_${scene.id}`,
        severity: 'WARNING',
        sceneId: scene.id,
        sceneName: scene.name,
        message:
          'Dead-end scene: no Choice, Branch, or Portal leads to another scene (and Scene Type is not ENDING).',
      });
    }
  });

  scenes.forEach((scene) => {
    if (!incomingLinks.has(scene.id)) {
      issues.push({
        id: `orphan_${scene.id}`,
        severity: 'WARNING',
        sceneId: scene.id,
        sceneName: scene.name,
        message: 'Unreachable orphan scene: no other scene links to this one.',
      });
    }
  });

  return issues;
}
