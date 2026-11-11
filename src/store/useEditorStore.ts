import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { SceneBlock, SceneType } from "@/lib/vn-schema";
import { ScenePayload } from "@/app/actions/editor-actions";
import { GameVariables } from "@/lib/vn-engine";
import { VNThemeId } from "@/lib/vn-themes";
import { ProjectAsset } from "@/app/actions/asset-actions";

interface EditorState {
  projectId: string;
  projectTitle: string;
  scenes: ScenePayload[];
  activeSceneId: string;
  selectedBlockId: string | null;
  isDirty: boolean;
  variables: GameVariables;
  theme: VNThemeId;
  enableClock: boolean;
  assets: ProjectAsset[];
  setAssets: (assets: ProjectAsset[]) => void;
  addAsset: (asset: ProjectAsset) => void;
  renameAssetLocal: (assetId: string, name: string) => void;
  removeAssetLocal: (assetId: string) => void;
  setTheme: (theme: VNThemeId) => void;

  initProject: (
    id: string,
    title: string,
    scenes: ScenePayload[],
    variables: GameVariables,
    theme: VNThemeId,
    enableClock: boolean,
  ) => void;
  setEnableClock: (enabled: boolean) => void;
  setVariable: (key: string, value: string | number | boolean) => void;
  deleteVariable: (key: string) => void;
  selectScene: (sceneId: string) => void;
  selectBlock: (blockId: string | null) => void;
  updateSceneMeta: (
    sceneId: string,
    name: string,
    sceneType: SceneType,
  ) => void;
  addBlock: (block: SceneBlock) => void;
  updateBlock: (blockId: string, updated: SceneBlock) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  markClean: () => void;
  addScene: () => void;
  deleteScene: (sceneId: string) => void;
  updateNodePos: (sceneId: string, pos: { x: number; y: number }) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  projectId: "",
  projectTitle: "",
  scenes: [],
  activeSceneId: "",
  selectedBlockId: null,
  isDirty: false,
  variables: {},
  theme: "MODERN",
  assets: [],
  enableClock: false,
  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set((state) => ({
      assets: [asset, ...state.assets],
    })),

  renameAssetLocal: (assetId, name) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === assetId ? { ...a, name } : a)),
    })),

  removeAssetLocal: (assetId) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== assetId),
    })),
  initProject: (
    projectId,
    projectTitle,
    scenes,
    variables,
    theme,
    enableClock,
  ) =>
    set({
      projectId,
      projectTitle,
      scenes,
      variables,
      theme,
      enableClock,
      activeSceneId: scenes.at(0)?.id ?? "",
      selectedBlockId: scenes.at(0)?.blocks.at(0)?.id ?? null,
      isDirty: false,
    }),

  setEnableClock: (enableClock) => set({ isDirty: true, enableClock }),
  setTheme: (theme) => set({ isDirty: true, theme }),
  setVariable: (key, value) =>
    set((state) => ({
      isDirty: true,
      variables: { ...state.variables, [key]: value },
    })),

  deleteVariable: (key) =>
    set((state) => {
      const next = { ...state.variables };
      delete next[key];
      return { isDirty: true, variables: next };
    }),

  selectScene: (sceneId) =>
    set((state) => {
      const target = state.scenes.find((s) => s.id === sceneId);
      return {
        activeSceneId: sceneId,
        selectedBlockId: target?.blocks[0]?.id ?? null,
      };
    }),

  selectBlock: (selectedBlockId) => set({ selectedBlockId }),

  updateSceneMeta: (sceneId, name, sceneType) =>
    set((state) => ({
      isDirty: true,
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, name, sceneType } : s,
      ),
    })),

  addBlock: (block) =>
    set((state) => ({
      isDirty: true,
      selectedBlockId: block.id,
      scenes: state.scenes.map((s) =>
        s.id === state.activeSceneId
          ? { ...s, blocks: [...s.blocks, block] }
          : s,
      ),
    })),

  updateBlock: (blockId, updated) =>
    set((state) => ({
      isDirty: true,
      scenes: state.scenes.map((s) =>
        s.id === state.activeSceneId
          ? {
              ...s,
              blocks: s.blocks.map((b) => (b.id === blockId ? updated : b)),
            }
          : s,
      ),
    })),

  deleteBlock: (blockId) =>
    set((state) => ({
      isDirty: true,
      selectedBlockId:
        state.selectedBlockId === blockId ? null : state.selectedBlockId,
      scenes: state.scenes.map((s) =>
        s.id === state.activeSceneId
          ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
          : s,
      ),
    })),

  reorderBlocks: (activeId, overId) =>
    set((state) => ({
      isDirty: true,
      scenes: state.scenes.map((s) => {
        if (s.id !== state.activeSceneId) return s;
        const oldIndex = s.blocks.findIndex((b) => b.id === activeId);
        const newIndex = s.blocks.findIndex((b) => b.id === overId);
        if (oldIndex === -1 || newIndex === -1) return s;
        return { ...s, blocks: arrayMove(s.blocks, oldIndex, newIndex) };
      }),
    })),

  markClean: () => set({ isDirty: false }),
  addScene: () =>
    set((state) => {
      const newSceneId = `scene_${crypto.randomUUID()}`;
      const newScene: ScenePayload = {
        id: newSceneId,
        name: `Scene ${state.scenes.length + 1}`,
        sceneType: "DIALOGUE",
        order: state.scenes.length,
        nodePos: { x: state.scenes.length * 320, y: 150 },
        blocks: [
          {
            id: `blk_${crypto.randomUUID()}`,
            type: "DIALOGUE",
            speaker: "Narrator",
            text: "A new scene begins...",
          },
        ],
      };

      return {
        isDirty: true,
        scenes: [...state.scenes, newScene],
        activeSceneId: newSceneId,
        selectedBlockId: newScene.blocks[0]?.id ?? null,
      };
    }),

  deleteScene: (sceneId) =>
    set((state) => {
      if (state.scenes.length <= 1) return state;

      const remaining = state.scenes.filter((s) => s.id !== sceneId);
      const nextActive =
        state.activeSceneId === sceneId ? remaining[0] : undefined;

      return {
        isDirty: true,
        scenes: remaining,
        activeSceneId: nextActive ? nextActive.id : state.activeSceneId,
        selectedBlockId: nextActive
          ? (nextActive.blocks[0]?.id ?? null)
          : state.selectedBlockId,
      };
    }),
  updateNodePos: (sceneId, nodePos) =>
    set((state) => ({
      isDirty: true,
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, nodePos } : s,
      ),
    })),
}));
