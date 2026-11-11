export interface AudioPreset {
  id: string;
  label: string;
  category: 'SFX' | 'BGM';
  url: string;
}

export const AUDIO_PRESETS: AudioPreset[] = [
  { id: 'sfx_chime', label: 'Magic Chime', category: 'SFX', url: 'synth:chime' },
  { id: 'sfx_coin', label: 'Item Pickup', category: 'SFX', url: 'synth:pickup' },
  { id: 'sfx_alert', label: 'Mystery Alert', category: 'SFX', url: 'synth:alert' },
  { id: 'bgm_ambient', label: 'Starlight Hum', category: 'BGM', url: 'synth:ambient_space' },
  { id: 'bgm_tension', label: 'Clockwork Pulse', category: 'BGM', url: 'synth:ambient_clock' },
];

export function playSynthSound(presetUrl: string): (() => void) | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  if (presetUrl === 'synth:chime' || presetUrl === 'synth:pickup') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = presetUrl === 'synth:chime' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(presetUrl === 'synth:chime' ? 523.25 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(presetUrl === 'synth:chime' ? 1046.5 : 880, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
    return () => ctx.close();
  }

  if (presetUrl === 'synth:alert') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.35);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
    return () => ctx.close();
  }

  if (presetUrl.startsWith('synth:ambient')) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(presetUrl === 'synth:ambient_space' ? 110 : 82.41, now);
    gain.gain.setValueAtTime(0.06, now);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    return () => {
      osc.stop();
      ctx.close();
    };
  }

  return null;
}
