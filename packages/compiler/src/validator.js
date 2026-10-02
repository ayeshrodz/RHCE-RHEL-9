import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { catalog, dataSchemaFor, schemaIds, schemas } from '@kernel-path/schema';

const COMMON = 'https://kernelpath.dev/schema/v1/common.schema.json';

/** One validator for every schema in the contract, plus catalog-aware tag checks. */
export function createValidator() {
  // strictRequired is off because conditional `required` lists name properties of the
  // enclosing schema, which is valid JSON Schema; every other strict check stays on.
  const ajv = new Ajv2020({ strict: true, strictRequired: false, allErrors: true });
  addFormats(ajv);
  for (const schema of schemas) ajv.addSchema(schema);
  const formats = new Map();
  const formatCheck = (name) => {
    if (!formats.has(name)) formats.set(name, ajv.compile({ $ref: `${COMMON}#/$defs/${name}` }));
    return formats.get(name);
  };
  const messages = (validate) => (validate.errors ?? []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);

  /** Validate a value against a schema $id; returns a list of messages. */
  function check(id, value) {
    const validate = ajv.getSchema(id);
    if (!validate) throw new Error(`Unknown schema ${id}`);
    return validate(value) ? [] : messages(validate);
  }

  /** Validate one attribute value against its catalog declaration. */
  function checkAttribute(spec, value) {
    const problems = [];
    const one = (v) => {
      if (spec.enum && !spec.enum.includes(v)) problems.push(`must be one of ${spec.enum.join(', ')}`);
      if (spec.format) {
        const validate = formatCheck(spec.format);
        if (!validate(v)) problems.push(`is not a valid ${spec.format} (${messages(validate).join('; ')})`);
      }
      if (typeof v === 'number') {
        if (spec.minimum !== undefined && v < spec.minimum) problems.push(`must be at least ${spec.minimum}`);
        if (spec.maximum !== undefined && v > spec.maximum) problems.push(`must be at most ${spec.maximum}`);
      }
    };
    switch (spec.type) {
      case 'string':
        if (typeof value !== 'string') return ['must be text'];
        one(value);
        break;
      case 'integer':
        if (!Number.isInteger(value)) return ['must be a whole number'];
        one(value);
        break;
      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) return ['must be a number'];
        one(value);
        break;
      case 'boolean':
        if (typeof value !== 'boolean') return ['must be true or false'];
        break;
      case 'string[]':
        if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) return ['must be a list of text values'];
        if (spec.maxItems && value.length > spec.maxItems) problems.push(`must have at most ${spec.maxItems} items`);
        value.forEach(one);
        break;
    }
    return problems;
  }

  /**
   * Check a tag's attributes, children and placement against the catalog.
   * `children` is the converted child nodes; `parent` is the enclosing tag name or 'page'.
   */
  function checkTag(name, attrs, children, parent) {
    const spec = catalog.components[name];
    if (!spec) return [`unknown tag '${name}'`];
    if (spec.status === 'planned') return [`tag '${name}' is planned and not available yet`];
    const problems = [];
    for (const [attr, value] of Object.entries(attrs)) {
      const declared = spec.attributes[attr];
      if (!declared) {
        problems.push(`'${name}' has no attribute '${attr}'`);
        continue;
      }
      for (const p of checkAttribute(declared, value)) problems.push(`'${name}' attribute '${attr}' ${p}`);
    }
    for (const required of spec.required ?? []) if (!(required in attrs)) problems.push(`'${name}' needs the attribute '${required}'`);
    if (spec.parents && !spec.parents.includes(parent))
      problems.push(`'${name}' must be inside ${spec.parents.join(' or ')}, not ${parent}`);
    const meaningful = children.filter((c) => !(c.t === 'text' && !c.v.trim()));
    if (spec.children === 'none' && meaningful.length) problems.push(`'${name}' cannot contain anything`);
    if (spec.children === 'tags')
      for (const child of meaningful)
        if (child.t !== 'tag' || !spec.allowedChildren.includes(child.name))
          problems.push(`'${name}' can only contain ${spec.allowedChildren.join(', ')}`);
    if (spec.children === 'inline')
      for (const child of meaningful)
        if (!(child.t === 'text' || (child.t === 'el' && ['strong', 'em', 'code', 'del'].includes(child.tag))))
          problems.push(`'${name}' can only contain inline text`);
    return problems;
  }

  /** Check a tag's referenced page data against the tag's data schema. */
  function checkData(name, value) {
    const id = dataSchemaFor(name);
    return id ? check(id, value) : [];
  }

  /** Validate a value against a shared format from common.schema.json. */
  function checkFormat(format, value) {
    const validate = formatCheck(format);
    return validate(value) ? [] : messages(validate);
  }

  return { check, checkTag, checkData, checkFormat, ids: schemaIds };
}
