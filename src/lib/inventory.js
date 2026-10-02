// A small, faithful-enough model of Ansible's INI inventory format, used by
// the interactive inventory widgets. Supports groups, :children, :vars,
// inline host vars, and [START:END] host ranges.

const RANGE = /\[([0-9a-zA-Z]+):([0-9a-zA-Z]+)(?::(\d+))?\]/;

/** Expand every [start:end] range in a host pattern. Returns { hosts, error }. */
export function expandRange(pattern, limit = 5000) {
  if (pattern.length > 2000 || (pattern.match(/\[/g) ?? []).length > 16) return { hosts: [], error: 'Use a shorter host range.' };
  const m = pattern.match(RANGE);
  if (!m) return { hosts: [pattern] };

  const [token, start, end, stepRaw] = m;
  const step = stepRaw ? Number(stepRaw) : 1;
  if (step < 1) return { hosts: [], error: 'Step must be 1 or more.' };

  const numeric = /^\d+$/.test(start) && /^\d+$/.test(end);
  const alpha = /^[a-zA-Z]$/.test(start) && /^[a-zA-Z]$/.test(end);
  let values = [];

  if (numeric) {
    const a = Number(start);
    const b = Number(end);
    if (a > b) return { hosts: [], error: `Range start ${start} is greater than end ${end}.` };
    if (![a, b, step].every(Number.isSafeInteger)) return { hosts: [], error: 'Range values must be safe integers.' };
    if (Math.floor((b - a) / step) + 1 > limit) return { hosts: [], error: `Use a range with at most ${limit} hosts.` };
    const width = start.length > 1 && start.startsWith('0') ? start.length : 0;
    for (let i = a; i <= b; i += step) values.push(width ? String(i).padStart(width, '0') : String(i));
  } else if (alpha) {
    const a = start.charCodeAt(0);
    const b = end.charCodeAt(0);
    if (a > b) return { hosts: [], error: `Range start ${start} comes after end ${end}.` };
    for (let c = a; c <= b; c += step) values.push(String.fromCharCode(c));
  } else {
    return { hosts: [], error: `"${token}" is not a valid range. Use numbers ([01:20]) or single letters ([a:c]).` };
  }

  const hosts = [];
  for (const v of values) {
    const rest = expandRange(pattern.replace(token, v), limit);
    if (rest.error) return rest;
    hosts.push(...rest.hosts);
    if (hosts.length > limit) return { hosts: [], error: `Use a range with at most ${limit} hosts.` };
  }
  return { hosts };
}

/** Parse INI inventory text into groups and hosts. */
export function parseInventory(text) {
  const oversized = text.length > 100000 || text.split('\n').length > 2000;
  if (oversized) text = '';
  const groups = new Map(); // name -> { hosts:Set, children:Set, vars:{} }
  const hostVars = new Map();
  const warnings = oversized ? ['Inventory is limited to 100 KB and 2,000 lines in this playground.'] : [];
  const ensure = (name) => {
    if (!groups.has(name)) groups.set(name, { hosts: new Set(), children: new Set(), vars: {} });
    return groups.get(name);
  };

  let expandedCount = 0;
  let section = { name: 'ungrouped', kind: 'hosts' };
  const lines = text.split('\n');

  lines.forEach((raw, i) => {
    const line = raw.replace(/\s[#;].*$/, '').trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) return;

    const header = line.match(/^\[([^\]:]+)(?::(children|vars))?\]$/);
    if (header) {
      const [, name, kind = 'hosts'] = header;
      if (!/^[A-Za-z0-9_-]+$/.test(name)) warnings.push(`Line ${i + 1}: group name "${name}" contains unusual characters.`);
      if (name.includes('-'))
        warnings.push(
          `Line ${i + 1}: "${name}" contains a dash. Ansible accepts it but prints an "invalid characters in group names" warning; underscores avoid that.`,
        );
      ensure(name);
      section = { name, kind };
      return;
    }

    const [first, ...rest] = line.split(/\s+/);
    if (section.kind === 'children') {
      ensure(first);
      if (first === section.name) warnings.push(`Line ${i + 1}: group "${first}" cannot be its own child.`);
      else ensure(section.name).children.add(first);
    } else if (section.kind === 'vars') {
      const [k, ...v] = line.split('=');
      ensure(section.name).vars[k.trim()] = v.join('=').trim();
    } else {
      const { hosts, error } = expandRange(first);
      if (error) warnings.push(`Line ${i + 1}: ${error}`);
      expandedCount += hosts.length;
      if (expandedCount > 5000) {
        warnings.push('Inventory expansion exceeds 5,000 host entries.');
        return;
      }
      for (const h of hosts) {
        ensure(section.name).hosts.add(h);
        const vars = hostVars.get(h) ?? {};
        rest.forEach((pair) => {
          const [k, ...v] = pair.split('=');
          if (k && v.length) vars[k] = v.join('=');
        });
        hostVars.set(h, vars);
      }
    }
  });

  // Every host belongs to "all"; hosts in no named group are "ungrouped".
  const allHosts = new Set();
  groups.forEach((g) => g.hosts.forEach((h) => allHosts.add(h)));
  const ungrouped = ensure('ungrouped');
  for (const h of allHosts) {
    const named = [...groups].some(([name, g]) => name !== 'ungrouped' && g.hosts.has(h));
    if (named) ungrouped.hosts.delete(h);
    else ungrouped.hosts.add(h);
  }

  for (const h of allHosts) {
    if (groups.has(h)) warnings.push(`"${h}" is both a host and a group name. ansible-navigator inventory warns about this.`);
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (name) => {
    if (visiting.has(name)) {
      warnings.push(`Cyclic group membership at ${name}. Remove the cycle.`);
      return;
    }
    if (visited.has(name)) return;
    if (visiting.size > 100) {
      warnings.push('Group nesting exceeds 100 levels.');
      return;
    }
    visiting.add(name);
    groups.get(name)?.children.forEach(visit);
    visiting.delete(name);
    visited.add(name);
  };
  groups.forEach((_, name) => visit(name));

  const childNames = new Set();
  groups.forEach((g) => g.children.forEach((c) => childNames.add(c)));
  const topLevel = [...groups.keys()].filter((n) => !childNames.has(n)).sort();

  return { groups, hostVars, allHosts: [...allHosts].sort(), topLevel, warnings };
}

/** Every host in a group, including hosts inherited from child groups. */
export function hostsOf(inv, name, seen = new Set()) {
  if (name === 'all') return inv.allHosts;
  const g = inv.groups.get(name);
  if (!g || seen.has(name)) return [];
  seen.add(name);
  const out = new Set(g.hosts);
  g.children.forEach((c) => hostsOf(inv, c, seen).forEach((h) => out.add(h)));
  return [...out].sort();
}

/** Groups a host is in, directly or through a parent group. */
export function groupsOf(inv, host) {
  const names = ['all'];
  inv.groups.forEach((_, name) => {
    if (hostsOf(inv, name).includes(host)) names.push(name);
  });
  return names;
}

/** Text in the same shape as `ansible-navigator inventory --graph <group>`. */
export function graph(inv, name) {
  const out = [];
  const walk = (group, prefix, ancestors = new Set()) => {
    if (ancestors.has(group)) {
      out.push(`${prefix}[cycle: ${group}]`);
      return;
    }
    if (ancestors.size > 100) {
      out.push(`${prefix}[nesting limit]`);
      return;
    }
    ancestors = new Set([...ancestors, group]);
    const g = inv.groups.get(group);
    if (!g) return;
    [...g.children].sort().forEach((c) => {
      out.push(`${prefix}|--@${c}:`);
      walk(c, `${prefix}|  `, ancestors);
    });
    [...g.hosts].sort().forEach((h) => out.push(`${prefix}|--${h}`));
  };

  out.push(`@${name}:`);
  if (name === 'all') {
    inv.topLevel
      .filter((n) => n !== 'ungrouped')
      .concat('ungrouped')
      .sort()
      .forEach((n) => {
        out.push(`  |--@${n}:`);
        walk(n, '  |  ');
      });
  } else {
    walk(name, '  ');
  }
  return out.join('\n');
}
