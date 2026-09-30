// Personal lab values (<HOST_LAN_IP> etc.) that readers type once and that
// are then filled into every code block and inline code on the site.
import { Children, cloneElement, isValidElement } from 'react';
import { useStored } from '@/lib/storage';

export const PLACEHOLDERS = [
  { key: 'HOST_LAN_IP', label: "Host's LAN IP", hint: 'hostname -I on the host', example: '192.168.1.50' },
  { key: 'HOST_USER', label: 'Your user on the host', hint: 'whoami on the host', example: 'alex' },
  { key: 'ROUTER_IP', label: 'Your router (default gateway)', hint: 'ip route | grep default', example: '192.168.1.1' },
];

const TOKEN = new RegExp(`<(${PLACEHOLDERS.map((p) => p.key).join('|')})>`, 'g');
const EMPTY = {};

export function usePlaceholderValues() {
  return useStored('labValues', EMPTY);
}

/** Split a string into text and <Placeholder> pieces. */
function fillString(text, values, keyPrefix) {
  if (!text.includes('<')) return text;
  const parts = [];
  let last = 0;
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const v = values[m[1]]?.trim();
    parts.push(
      <span
        key={`${keyPrefix}-${m.index}`}
        className={`ph ${v ? 'is-filled' : 'is-empty'}`}
        title={v ? `<${m[1]}>` : 'Fill in your lab values to replace this'}
      >
        {v || m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (!parts.length) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf(node.props.children);
  return '';
}

/**
 * Walk a highlighted code tree. Shiki can split "<HOST_LAN_IP>" across
 * several token spans, so any line that contains a placeholder is re-rendered
 * as plain text with the value substituted; other lines keep their colours.
 */
export function fillCodeTree(node, values, depth = 0) {
  return Children.map(node, (child, i) => {
    if (!isValidElement(child)) return typeof child === 'string' ? fillString(child, values, `s${depth}-${i}`) : child;
    const cls = child.props.className ?? '';
    if (/\bline\b/.test(cls)) {
      const text = textOf(child.props.children);
      TOKEN.lastIndex = 0;
      if (!TOKEN.test(text)) return child;
      return cloneElement(child, {}, fillString(text, values, `l${depth}-${i}`));
    }
    if (child.props.children == null) return child;
    return cloneElement(child, {}, fillCodeTree(child.props.children, values, depth + 1));
  });
}

/** Inline `code` in prose: fill plain string children. */
export function fillInline(children, values) {
  return Children.map(children, (c, i) => (typeof c === 'string' ? fillString(c, values, `i${i}`) : c));
}
