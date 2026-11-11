export interface GalleryStorageData {
  achievements: string[];
  endings: string[];
}

const EMPTY_DATA: GalleryStorageData = { achievements: [], endings: [] };
let cachedRaw: string | null = null;
let cachedParsed: GalleryStorageData = EMPTY_DATA;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeGallery(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('vn_gallery_')) {
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getGallerySnapshot(storageKey: string): GalleryStorageData {
  if (typeof window === 'undefined') return EMPTY_DATA;
  const raw = window.localStorage.getItem(storageKey);
  if (raw === cachedRaw) return cachedParsed;

  cachedRaw = raw;
  if (!raw) {
    cachedParsed = EMPTY_DATA;
    return cachedParsed;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GalleryStorageData>;
    cachedParsed = {
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      endings: Array.isArray(parsed.endings) ? parsed.endings : [],
    };
  } catch {
    cachedParsed = EMPTY_DATA;
  }
  return cachedParsed;
}

export function getGalleryServerSnapshot(): GalleryStorageData {
  return EMPTY_DATA;
}

export function saveAchievementToStorage(
  storageKey: string,
  achievementId: string
): boolean {
  const current = getGallerySnapshot(storageKey);
  if (current.achievements.includes(achievementId)) return false;

  const next: GalleryStorageData = {
    achievements: [...current.achievements, achievementId],
    endings: current.endings,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  emitChange();
  return true;
}

export function saveEndingToStorage(
  storageKey: string,
  endingSceneId: string
): void {
  const current = getGallerySnapshot(storageKey);
  if (current.endings.includes(endingSceneId)) return;

  const next: GalleryStorageData = {
    achievements: current.achievements,
    endings: [...current.endings, endingSceneId],
  };
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  emitChange();
}