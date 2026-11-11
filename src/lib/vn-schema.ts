import { z } from "zod";

export const ChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Choice text is required"),
  targetSceneId: z.string(),
  requiredItem: z.string().optional(),
  condition: z
    .object({
      variableKey: z.string(),
      operator: z.enum(["==", "!=", ">", "<", ">=", "<="]),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
    .optional(),
});
export const HotspotZoneSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(2).max(100),
  height: z.number().min(2).max(100),
  actionType: z.enum(["INSPECT", "GIVE_ITEM", "SET_VARIABLE", "JUMP_SCENE"]),
  dialogueText: z.string().optional(),
  itemName: z.string().optional(),
  variableKey: z.string().optional(),
  variableValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  targetSceneId: z.string().optional(),
  requiredItem: z.string().optional(),
});
export const SceneBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("BACKGROUND"),
    assetUrl: z.string(),
    transition: z.enum(["none", "fade"]).default("fade"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("CHARACTER"),
    name: z.string(),
    spriteUrl: z.string(),
    position: z.enum(["left", "center", "right"]).default("center"),
    action: z.enum(["enter", "exit"]).default("enter"),
    emotion: z
      .enum(["neutral", "happy", "angry", "shocked", "sad"])
      .default("neutral"),
    animation: z
      .enum(["none", "bounce", "shake", "pulse", "slide-in"])
      .default("none"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("DIALOGUE"),
    speaker: z.string(),
    text: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("SET_VARIABLE"),
    variableKey: z.string(),
    operation: z.enum(["set", "add", "subtract"]),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  z.object({
    id: z.string(),
    type: z.literal("CHOICE"),
    prompt: z.string().optional(),
    options: z.array(ChoiceOptionSchema),
  }),
  z.object({
    id: z.string(),
    type: z.literal("INVENTORY"),
    action: z.enum(["give", "remove"]),
    itemName: z.string().min(1),
  }),
  z.object({
    id: z.string(),
    type: z.literal("BRANCH"),
    checkType: z.enum(["VARIABLE", "HAS_ITEM"]),
    variableKey: z.string().optional(),
    operator: z.enum(["==", "!=", ">", "<", ">=", "<="]).optional(),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    itemName: z.string().optional(),
    trueSceneId: z.string(),
    falseSceneId: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("PLAY_AUDIO"),
    audioType: z.enum(["SFX", "BGM"]),
    soundUrl: z.string(),
    loop: z.boolean().default(false),
    action: z.enum(["play", "stop"]).default("play"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("INPUT_TEXT"),
    prompt: z.string().min(1),
    placeholder: z.string().default("Type your answer..."),
    targetVariable: z.string().min(1),
    defaultValue: z.string().default("Traveler"),
  }),
  z.object({
    id: z.string(),
    type: z.literal("HOTSPOT_ROOM"),
    backgroundUrl: z.string(),
    promptText: z.string().default("Click around the room to explore."),
    hotspots: z.array(HotspotZoneSchema),
  }),
  z.object({
    id: z.string(),
    type: z.literal("TIMER"),
    action: z.enum(["start", "stop"]).default("start"),
    label: z.string().default("Time Remaining"),
    durationSeconds: z.number().min(1).max(600).default(15),
    timeoutSceneId: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("AFFINITY"),
    characterName: z.string().min(1),
    delta: z.number(),
    reason: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("ADVANCE_TIME"),
    mode: z.enum(["NEXT_SLOT", "SET_EXACT"]).default("NEXT_SLOT"),
    targetTime: z
      .enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"])
      .default("AFTERNOON"),
    dayDelta: z.number().min(0).max(365).default(0),
  }),
  z.object({
    id: z.string(),
    type: z.literal("UNLOCK_ACHIEVEMENT"),
    achievementId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default("Unlocked a special milestone!"),
    icon: z.string().default("🏆"),
  }),
]);

export type HotspotZone = z.infer<typeof HotspotZoneSchema>;
export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;
export type SceneBlock = z.infer<typeof SceneBlockSchema>;
export type SceneType = "TITLE" | "DIALOGUE" | "HOTSPOT" | "ENDING";
export type CharacterEmotion =
  | "neutral"
  | "happy"
  | "angry"
  | "shocked"
  | "sad";
export type StageAnimation = "none" | "bounce" | "shake" | "pulse" | "slide-in";
export type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
