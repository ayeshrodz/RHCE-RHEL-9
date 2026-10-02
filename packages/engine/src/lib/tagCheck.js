// The browser re-checks every tag against the component catalog before rendering it: the tag must
// exist, carry only the attributes the catalog declares, with the declared types and values, and
// bring the attributes it requires. A page that fails is refused, not partly rendered.
import { TAGS } from '@kernel-path/schema/validators';

/** Returns a description of the first problem with a tag node, or null when it is fine. */
export function tagProblem(node) {
  const spec = Object.hasOwn(TAGS, node.name) ? TAGS[node.name] : null;
  if (!spec) return `unknown component '${node.name}'`;
  const attrs = node.attrs ?? {};
  for (const [key, value] of Object.entries(attrs)) {
    const declared = Object.hasOwn(spec.attributes, key) ? spec.attributes[key] : null;
    if (!declared) return `'${node.name}' has no attribute '${key}'`;
    const wrong = `'${node.name}' attribute '${key}' has the wrong kind of value`;
    switch (declared.type) {
      case 'string':
        if (typeof value !== 'string') return wrong;
        if (declared.enum && !declared.enum.includes(value)) return wrong;
        break;
      case 'integer':
      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value) || (declared.type === 'integer' && !Number.isInteger(value))) return wrong;
        if (declared.enum && !declared.enum.includes(value)) return wrong;
        if ((declared.minimum !== undefined && value < declared.minimum) || (declared.maximum !== undefined && value > declared.maximum))
          return wrong;
        break;
      case 'boolean':
        if (typeof value !== 'boolean') return wrong;
        break;
      case 'string[]':
        if (
          !Array.isArray(value) ||
          !value.every((v) => typeof v === 'string') ||
          (declared.maxItems !== undefined && value.length > declared.maxItems)
        )
          return wrong;
        break;
      default:
        return wrong;
    }
  }
  for (const required of spec.required) if (!Object.hasOwn(attrs, required)) return `'${node.name}' needs the attribute '${required}'`;
  return null;
}
