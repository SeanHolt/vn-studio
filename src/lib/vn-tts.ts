export type VoiceStyleId = 'AUTO' | 'NARRATOR' | 'HERO' | 'MYSTIC' | 'ROBOT';

const STYLE_CONFIG: Record<
  Exclude<VoiceStyleId, 'AUTO'>,
  { pitch: number; rate: number }
> = {
  NARRATOR: { pitch: 0.92, rate: 0.98 },
  HERO: { pitch: 1.12, rate: 1.04 },
  MYSTIC: { pitch: 1.22, rate: 0.94 },
  ROBOT: { pitch: 0.78, rate: 1.12 },
};

function inferVoiceStyle(
  speaker: string,
  explicitStyle?: VoiceStyleId
): Exclude<VoiceStyleId, 'AUTO'> {
  if (explicitStyle && explicitStyle !== 'AUTO') {
    return explicitStyle;
  }

  const lower = speaker.trim().toLowerCase();
  if (!lower || lower === 'narrator' || lower === 'system') {
    return 'NARRATOR';
  }
  if (
    lower.includes('a.i.') ||
    lower.includes('ai ') ||
    lower.includes('vex') ||
    lower.includes('bot') ||
    lower.includes('unit')
  ) {
    return 'ROBOT';
  }
  if (
    lower.includes('mage') ||
    lower.includes('archmage') ||
    lower.includes('keeper') ||
    lower.includes('elder') ||
    lower.includes('lyra')
  ) {
    return 'MYSTIC';
  }
  return 'HERO';
}

export function stopSpeechNarration(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}

export function speakDialogueLine(
  speaker: string,
  text: string,
  voiceStyle?: VoiceStyleId
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const cleanText = text.trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();

  const style = inferVoiceStyle(speaker, voiceStyle);
  const cfg = STYLE_CONFIG[style];

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = cfg.pitch;
  utterance.rate = cfg.rate;
  utterance.volume = 0.95;

  window.speechSynthesis.speak(utterance);
}
