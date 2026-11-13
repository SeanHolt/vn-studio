import { BattleElement } from './vn-schema';

export const ELEMENT_BADGES: Record<
  BattleElement,
  { label: string; icon: string; badgeClass: string }
> = {
  NEUTRAL: {
    label: 'Neutral',
    icon: '⚔️',
    badgeClass: 'border-slate-600 bg-slate-800 text-slate-200',
  },
  FIRE: {
    label: 'Fire',
    icon: '🔥',
    badgeClass: 'border-orange-500/50 bg-orange-950/60 text-orange-200',
  },
  ICE: {
    label: 'Ice',
    icon: '❄️',
    badgeClass: 'border-cyan-500/50 bg-cyan-950/60 text-cyan-200',
  },
  LIGHTNING: {
    label: 'Lightning',
    icon: '⚡',
    badgeClass: 'border-amber-500/50 bg-amber-950/60 text-amber-200',
  },
};

export function computeSkillDamage(
  baseAttack: number,
  skillElement: BattleElement,
  enemyWeakness: BattleElement
): { damage: number; isSuperEffective: boolean } {
  const isSuperEffective =
    skillElement !== 'NEUTRAL' && skillElement === enemyWeakness;
  const raw = baseAttack * 1.45 * (isSuperEffective ? 1.5 : 1);
  return {
    damage: Math.max(1, Math.round(raw)),
    isSuperEffective,
  };
}
