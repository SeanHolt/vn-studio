import { TimeOfDay } from './vn-schema';

export interface GameClockState {
  day: number;
  timeOfDay: TimeOfDay;
}

const TIME_ORDER: TimeOfDay[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

export const TIME_DISPLAY: Record<
  TimeOfDay,
  { label: string; icon: string; tintClass: string }
> = {
  MORNING: {
    label: 'Morning',
    icon: '🌅',
    tintClass: 'bg-sky-300/5',
  },
  AFTERNOON: {
    label: 'Afternoon',
    icon: '☀️',
    tintClass: 'bg-amber-300/10',
  },
  EVENING: {
    label: 'Evening',
    icon: '🌇',
    tintClass: 'bg-orange-600/20',
  },
  NIGHT: {
    label: 'Night',
    icon: '🌙',
    tintClass: 'bg-indigo-950/45',
  },
};

export function advanceGameClock(
  current: GameClockState,
  mode: 'NEXT_SLOT' | 'SET_EXACT',
  targetTime: TimeOfDay,
  dayDelta: number
): GameClockState {
  if (mode === 'SET_EXACT') {
    return {
      day: Math.max(1, current.day + dayDelta),
      timeOfDay: targetTime,
    };
  }

  const idx = TIME_ORDER.indexOf(current.timeOfDay);
  if (idx === -1 || idx === TIME_ORDER.length - 1) {
    return {
      day: current.day + 1 + dayDelta,
      timeOfDay: 'MORNING',
    };
  }

  const nextSlot = TIME_ORDER[idx + 1] ?? 'MORNING';
  return {
    day: current.day + dayDelta,
    timeOfDay: nextSlot,
  };
}
