import {
  loadDbAutoSaveSlot0,
  saveDbAutoSaveSlot0,
  clearDbAutoSaveSlot0,
} from '@/app/actions/autosave-actions';

export interface LocalSlot0Record {
  sceneName: string;
  savedAtMs: number;
  stateJson: Record<string, unknown>;
}

function getLocalSlot0Key(projectId: string): string {
  return `vn_slot0_${projectId}`;
}

export function readLocalSlot0(projectId: string): LocalSlot0Record | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getLocalSlot0Key(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSlot0Record;
    if (
      typeof parsed.savedAtMs !== 'number' ||
      typeof parsed.stateJson !== 'object' ||
      parsed.stateJson === null
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalSlot0(
  projectId: string,
  record: LocalSlot0Record
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getLocalSlot0Key(projectId),
      JSON.stringify(record)
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function clearLocalSlot0(projectId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getLocalSlot0Key(projectId));
}

export async function resolveNewestSlot0OnStart(
  projectId: string,
  isSignedIn: boolean
): Promise<LocalSlot0Record | null> {
  const localRec = readLocalSlot0(projectId);

  if (!isSignedIn) {
    return localRec;
  }

  const dbRec = await loadDbAutoSaveSlot0(projectId);

  if (!localRec && !dbRec) return null;
  if (!dbRec) return localRec;
  if (!localRec) {
    writeLocalSlot0(projectId, dbRec);
    return dbRec;
  }

  if (dbRec.savedAtMs >= localRec.savedAtMs) {
    writeLocalSlot0(projectId, dbRec);
    return dbRec;
  }

  void saveDbAutoSaveSlot0({
    projectId,
    sceneName: localRec.sceneName,
    savedAtMs: localRec.savedAtMs,
    stateJson: localRec.stateJson,
  });
  return localRec;
}

export function syncSlot0DuringPlay(params: {
  projectId: string;
  isSignedIn: boolean;
  sceneName: string;
  stateJson: Record<string, unknown>;
}): LocalSlot0Record {
  const record: LocalSlot0Record = {
    sceneName: params.sceneName,
    savedAtMs: Date.now(),
    stateJson: params.stateJson,
  };

  writeLocalSlot0(params.projectId, record);

  if (params.isSignedIn) {
    void saveDbAutoSaveSlot0({
      projectId: params.projectId,
      sceneName: record.sceneName,
      savedAtMs: record.savedAtMs,
      stateJson: record.stateJson,
    });
  }

  return record;
}

export async function resetAllSlot0(
  projectId: string,
  isSignedIn: boolean
): Promise<void> {
  clearLocalSlot0(projectId);
  if (isSignedIn) {
    await clearDbAutoSaveSlot0(projectId);
  }
}
