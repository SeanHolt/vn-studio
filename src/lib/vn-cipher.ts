export type CipherThemeId = 'SCIFI' | 'ANCIENT' | 'CYBER';

export interface CipherPreset {
  label: string;
  title: string;
  clueText: string;
  secretPhrase: string;
  theme: CipherThemeId;
}

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export function isAlphaChar(ch: string): boolean {
  return /^[A-Z]$/.test(ch);
}

export function isCipherSolved(
  secretPhrase: string,
  guessedLetters: string[]
): boolean {
  const upper = secretPhrase.toUpperCase();
  const guessedSet = new Set(guessedLetters.map((l) => l.toUpperCase()));

  for (let i = 0; i < upper.length; i += 1) {
    const ch = upper.charAt(i);
    if (isAlphaChar(ch) && !guessedSet.has(ch)) {
      return false;
    }
  }
  return true;
}

export const CIPHER_PRESETS: Record<
  'DEEP_SPACE' | 'ANCIENT_SCROLL' | 'CYBER_VAULT',
  CipherPreset
> = {
  DEEP_SPACE: {
    label: '🚀 Deep Space Transmission (Sci-Fi)',
    title: 'Starfleet Quantum Decryptor',
    clueText: 'Hidden rendezvous sector beyond the asteroid belt.',
    secretPhrase: 'ORION NEBULA',
    theme: 'SCIFI',
  },
  ANCIENT_SCROLL: {
    label: '📜 Ancient Temple Prophecy (Fantasy)',
    title: 'Elder Rune Cipher Tablet',
    clueText: 'The artifact that awakens the sleeping stone guardian.',
    secretPhrase: 'CROWN OF DAWN',
    theme: 'ANCIENT',
  },
  CYBER_VAULT: {
    label: '💻 Mainframe Override Key (Cyber)',
    title: 'Zero-Day Password Cracker',
    clueText: 'Root override command for the orbital defense grid.',
    secretPhrase: 'GHOST PROTOCOL',
    theme: 'CYBER',
  },
};
