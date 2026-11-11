export type VNThemeId = 'MODERN' | 'SCIFI' | 'FANTASY' | 'RETRO';

export interface VNThemeConfig {
  id: VNThemeId;
  label: string;
  description: string;
  fontClass: string;
  dialogueBoxClass: string;
  speakerClass: string;
  dialogueTextClass: string;
  choiceButtonClass: string;
}

export const VN_THEMES: Record<VNThemeId, VNThemeConfig> = {
  MODERN: {
    id: 'MODERN',
    label: 'Modern Studio',
    description: 'Clean dark glass with indigo accents',
    fontClass: 'font-sans',
    dialogueBoxClass:
      'rounded-xl border border-slate-700/80 bg-slate-950/90 backdrop-blur-md shadow-xl',
    speakerClass: 'text-indigo-400 font-bold tracking-wide',
    dialogueTextClass: 'text-slate-100',
    choiceButtonClass:
      'rounded-lg border border-indigo-500/40 bg-slate-900/90 text-white hover:border-indigo-400 hover:bg-indigo-600',
  },
  SCIFI: {
    id: 'SCIFI',
    label: 'Sci-Fi Terminal',
    description: 'Monospace HUD with glowing cyan borders',
    fontClass: 'font-mono',
    dialogueBoxClass:
      'rounded-none border-2 border-cyan-500/70 bg-slate-950/95 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    speakerClass: 'text-cyan-400 font-bold uppercase tracking-widest',
    dialogueTextClass: 'text-cyan-50',
    choiceButtonClass:
      'rounded-none border border-cyan-500/60 bg-cyan-950/80 text-cyan-100 hover:bg-cyan-600 hover:text-slate-950',
  },
  FANTASY: {
    id: 'FANTASY',
    label: 'Fantasy Parchment',
    description: 'Warm storybook serif with golden trim',
    fontClass: 'font-serif',
    dialogueBoxClass:
      'rounded-2xl border-2 border-amber-500/60 bg-stone-900/95 shadow-2xl',
    speakerClass: 'text-amber-400 font-bold tracking-normal text-base',
    dialogueTextClass: 'text-amber-50',
    choiceButtonClass:
      'rounded-xl border border-amber-500/50 bg-stone-900/95 text-amber-100 hover:border-amber-300 hover:bg-amber-700',
  },
  RETRO: {
    id: 'RETRO',
    label: '8-Bit Arcade',
    description: 'Crisp double-bordered classic RPG frame',
    fontClass: 'font-mono',
    dialogueBoxClass:
      'rounded-sm border-4 border-double border-white bg-blue-950/95 shadow-none',
    speakerClass: 'text-yellow-300 font-extrabold uppercase',
    dialogueTextClass: 'text-white',
    choiceButtonClass:
      'rounded-sm border-2 border-white bg-blue-950 text-white hover:bg-white hover:text-blue-950',
  },
};

export function getThemeConfig(themeId?: string): VNThemeConfig {
  if (themeId && themeId in VN_THEMES) {
    return VN_THEMES[themeId as VNThemeId];
  }
  return VN_THEMES.MODERN;
}
