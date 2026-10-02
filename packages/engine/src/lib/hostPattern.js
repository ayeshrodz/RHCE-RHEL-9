// Resolves an Ansible host pattern against a parsed inventory (see inventory.js),
// following Ansible's rules: terms are separated by commas (or colons), plain
// terms are added together first, then "&" terms intersect, then "!" terms
// exclude, whatever order they were written in.

/** Hosts of a group in inventory order (its own hosts, then its children's). */
function orderedHosts(inv, name, seen = new Set()) {
  if (name === 'all') {
    const out = [];
    inv.groups.forEach((g) => g.hosts.forEach((h) => out.includes(h) || out.push(h)));
    return out;
  }
  const pending = [name];
  const out = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    const group = inv.groups.get(current);
    if (!group) continue;
    group.hosts.forEach((host) => out.add(host));
    pending.push(...[...group.children].reverse());
  }
  return [...out];
}

// Match * and ? without compiling learner input into a backtracking regex.
function wildcardMatch(value, pattern, budget) {
  let i = 0,
    j = 0,
    star = -1,
    retry = 0;
  while (i < value.length) {
    if (--budget.steps < 0) throw new Error('Wildcard matching exceeded the playground work limit. Use a simpler pattern.');
    if (pattern[j] === '?' || pattern[j] === value[i]) {
      i++;
      j++;
    } else if (pattern[j] === '*') {
      star = j++;
      retry = i;
    } else if (star >= 0) {
      j = star + 1;
      i = ++retry;
    } else return false;
  }
  while (pattern[j] === '*') j++;
  return j === pattern.length;
}

function resolveName(inv, name) {
  const all = orderedHosts(inv, 'all');
  const groupNames = ['all', ...inv.groups.keys()];

  if (name.startsWith('~')) {
    if (name.length > 100 || /[()\\]/.test(name) || (name.match(/[+*?{]/g) ?? []).length > 1)
      return { error: 'This playground supports simple regular expressions without groups, backreferences, or repeated quantifiers.' };
    let re;
    try {
      re = new RegExp(name.slice(1));
    } catch {
      return { error: `"${name.slice(1)}" is not a valid regular expression` };
    }
    const out = [];
    groupNames.filter((g) => re.test(g)).forEach((g) => orderedHosts(inv, g).forEach((h) => out.includes(h) || out.push(h)));
    all.filter((h) => re.test(h)).forEach((h) => out.includes(h) || out.push(h));
    return { hosts: out, how: 'regular expression, tested against every group and host name' };
  }

  if (/[*?]/.test(name)) {
    const budget = { steps: 500000 };
    const out = [];
    try {
      groupNames
        .filter((g) => wildcardMatch(g, name, budget))
        .forEach((g) => orderedHosts(inv, g).forEach((h) => out.includes(h) || out.push(h)));
      all.filter((h) => wildcardMatch(h, name, budget)).forEach((h) => out.includes(h) || out.push(h));
    } catch (error) {
      return { error: error.message };
    }
    return { hosts: out, how: 'wildcard, matched against group names and host names' };
  }

  if (name === 'all' || inv.groups.has(name)) return { hosts: orderedHosts(inv, name), how: name === 'all' ? 'every host' : 'group' };
  if (all.includes(name)) return { hosts: [name], how: 'host' };
  return { hosts: [], warning: `Could not match supplied host pattern, ignoring: ${name}` };
}

function resolveTerm(inv, raw) {
  const op = raw[0] === '!' || raw[0] === '&' ? raw[0] : '';
  let name = op ? raw.slice(1) : raw;
  let slice = null;
  const m = !name.startsWith('~') && name.match(/^(.*)\[(-?\d+)(?:([:-])(-?\d*))?\]$/);
  if (m) {
    name = m[1];
    slice = { start: m[2], sep: m[3], end: m[4] };
  }
  const r = resolveName(inv, name);
  if (r.error || !slice) return { raw, op, ...r };

  const n = r.hosts.length;
  let hosts;
  if (!slice.sep) {
    const i = Number(slice.start);
    const h = r.hosts[i < 0 ? n + i : i];
    hosts = h ? [h] : [];
  } else {
    const start = slice.start === '' ? 0 : Number(slice.start);
    const end = slice.end === '' ? n - 1 : Number(slice.end); // Ansible ranges include the end
    hosts = r.hosts.slice(start, end + 1);
  }
  return { raw, op, hosts, how: `${r.how}, then position ${raw.slice(raw.indexOf('['))} in inventory order`, warning: r.warning };
}

export function matchPattern(inv, pattern) {
  const text = pattern.trim();
  if (text.length > 2000) return { hosts: [], terms: [], error: 'Use a shorter pattern.' };
  if (!text) return { hosts: [], terms: [], error: 'Type a pattern.' };
  const raws = text
    .split(/[,]|:(?![^[]*\])/)
    .map((t) => t.trim())
    .filter(Boolean);
  const terms = raws.map((raw) => resolveTerm(inv, raw));
  const bad = terms.find((t) => t.error);
  if (bad) return { hosts: [], terms, error: bad.error };

  const plain = terms.filter((t) => !t.op);
  const and = terms.filter((t) => t.op === '&');
  const not = terms.filter((t) => t.op === '!');
  // A pattern made only of exclusions or intersections starts from "all".
  let hosts = plain.length ? [] : orderedHosts(inv, 'all');
  plain.forEach((t) => t.hosts.forEach((h) => hosts.includes(h) || hosts.push(h)));
  and.forEach((t) => (hosts = hosts.filter((h) => t.hosts.includes(h))));
  not.forEach((t) => (hosts = hosts.filter((h) => !t.hosts.includes(h))));
  return { hosts, terms, warnings: terms.filter((t) => t.warning).map((t) => t.warning) };
}

export { orderedHosts };
