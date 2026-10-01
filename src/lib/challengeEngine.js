import YAML from 'yaml';
import { parseInventory } from './inventory.js';
import { matchPattern } from './hostPattern.js';
import { render } from './jinja.js';

function contains(actual, expected) {
  if (Array.isArray(expected))
    return Array.isArray(actual) && actual.length === expected.length && expected.every((e, i) => contains(actual[i], e));
  if (expected && typeof expected === 'object')
    return (
      actual !== null &&
      typeof actual === 'object' &&
      Object.entries(expected).every(([k, v]) => Object.hasOwn(actual, k) && contains(actual[k], v))
    );
  return actual === expected;
}
export function evaluateChallenge(challenge, input) {
  if (!input.trim()) return { passed: false, feedback: 'Make an attempt before checking.' };
  if (input.length > 20000) return { passed: false, feedback: 'Keep your answer under 20 KB.' };
  try {
    let passed = false;
    if (challenge.type === 'yaml') passed = contains(YAML.parse(input, { version: '1.1', maxAliasCount: 20 }), challenge.expected);
    else if (challenge.type === 'inventory') {
      const result = matchPattern(parseInventory(challenge.inventory), input);
      if (result.error) return { passed: false, feedback: result.error };
      passed = JSON.stringify([...result.hosts].sort()) === JSON.stringify([...challenge.expected].sort());
    } else if (challenge.type === 'template') passed = render(input, challenge.context) === challenge.expected;
    else if (challenge.type === 'text') passed = input.toUpperCase().replace(/\s/g, '') === challenge.expected;
    else passed = input === challenge.expected;
    return {
      passed,
      feedback: passed
        ? challenge.explain
        : 'The result does not meet the requirement yet. Compare your answer with the task, or open the next hint.',
    };
  } catch (e) {
    return { passed: false, feedback: e.message };
  }
}
export function solutionFor(challenge) {
  if (challenge.solution) return challenge.solution;
  if (challenge.type === 'yaml') return YAML.stringify(challenge.expected);
  if (challenge.type === 'inventory') return challenge.expected.join(',');
  return challenge.expected;
}
