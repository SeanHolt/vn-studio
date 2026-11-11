import { ChoiceOption } from './vn-schema';

export type GameVariables = Record<string, string | number | boolean>;

export function evaluateCondition(
  condition: ChoiceOption['condition'],
  variables: GameVariables
): boolean {
  if (!condition) return true;

  const currentVal = variables[condition.variableKey];
  const targetVal = condition.value;

  if (currentVal === undefined) return false;

  switch (condition.operator) {
    case '==':
      return currentVal === targetVal;
    case '!=':
      return currentVal !== targetVal;
    case '>':
      return typeof currentVal === 'number' && typeof targetVal === 'number' && currentVal > targetVal;
    case '<':
      return typeof currentVal === 'number' && typeof targetVal === 'number' && currentVal < targetVal;
    case '>=':
      return typeof currentVal === 'number' && typeof targetVal === 'number' && currentVal >= targetVal;
    case '<=':
      return typeof currentVal === 'number' && typeof targetVal === 'number' && currentVal <= targetVal;
    default:
      return false;
  }
}

export function applyVariableOperation(
  variables: GameVariables,
  key: string,
  operation: 'set' | 'add' | 'subtract',
  value: string | number | boolean
): GameVariables {
  const next = { ...variables };
  const current = next[key];

  if (operation === 'set') {
    next[key] = value;
  } else if (operation === 'add' && typeof current === 'number' && typeof value === 'number') {
    next[key] = current + value;
  } else if (operation === 'subtract' && typeof current === 'number' && typeof value === 'number') {
    next[key] = current - value;
  }

  return next;
}
export function interpolateVariables(
  text: string,
  variables: GameVariables
): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const val = variables[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}