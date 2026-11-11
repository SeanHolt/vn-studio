import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const ASSETS: Record<string, string> = {
  'bg-night-sky.svg': `<svg xmlns="http://w3.org" width="800" height="450" viewBox="0 0 800 450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090d16"/><stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="650" cy="90" r="36" fill="#fef08a" opacity="0.9"/>
    <circle cx="140" cy="80" r="3" fill="#ffffff"/><circle cx="320" cy="120" r="3" fill="#ffffff"/>
    <circle cx="480" cy="60" r="2.5" fill="#ffffff"/><circle cx="220" cy="190" r="2" fill="#ffffff"/>
  </svg>`,
  'bg-sunset-bay.svg': `<svg xmlns="http://w3.org" width="800" height="450" viewBox="0 0 800 450">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4c1d95"/><stop offset="55%" stop-color="#db2777"/><stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient></defs>
    <rect width="800" height="310" fill="url(#s)"/>
    <circle cx="400" cy="280" r="65" fill="#fde047"/>
    <rect y="310" width="800" height="140" fill="#0f172a"/>
  </svg>`,
  'bg-forest-mist.svg': `<svg xmlns="http://w3.org" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#064e3b"/>
    <polygon points="120,450 200,140 280,450" fill="#022c22"/>
    <polygon points="340,450 430,110 520,450" fill="#065f46"/>
    <polygon points="560,450 650,160 740,450" fill="#022c22"/>
  </svg>`,
  'char-hero-blue.svg': `<svg xmlns="http://w3.org" width="200" height="320" viewBox="0 0 200 320">
    <circle cx="100" cy="75" r="42" fill="#fed7aa"/>
    <path d="M58,65 Q100,10 142,65 Z" fill="#1e293b"/>
    <circle cx="86" cy="75" r="4" fill="#0f172a"/><circle cx="114" cy="75" r="4" fill="#0f172a"/>
    <path d="M45,320 L60,135 Q100,120 140,135 L155,320 Z" fill="#3b82f6"/>
  </svg>`,
  'char-mage-violet.svg': `<svg xmlns="http://w3.org" width="200" height="320" viewBox="0 0 200 320">
    <circle cx="100" cy="80" r="40" fill="#fde68a"/>
    <polygon points="45,65 100,5 155,65" fill="#6d28d9"/>
    <circle cx="86" cy="80" r="4" fill="#0f172a"/><circle cx="114" cy="80" r="4" fill="#0f172a"/>
    <path d="M40,320 L58,135 Q100,125 142,135 L160,320 Z" fill="#7c3aed"/>
  </svg>`,
};

async function run() {
  const outDir = path.join(process.cwd(), 'public', 'assets');
  await mkdir(outDir, { recursive: true });
  for (const [filename, content] of Object.entries(ASSETS)) {
    await writeFile(path.join(outDir, filename), content.trim(), 'utf8');
  }
  console.log('Generated 5 starter SVG files in public/assets/');
}

run();
