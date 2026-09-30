import { useMemo, useState } from 'react';
import DataExplorer from './DataExplorer';
import { Arrow, Diagram, Node } from '../kit';

const START = `[general]
package = httpd
service = httpd
state = started
enabled = true
`;

// Mirrors how setup reads an INI .fact file: sections become dictionaries,
// keys inside them become strings.
function parseIni(text) {
  const out = {};
  const errors = [];
  let section = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) return;
    const h = line.match(/^\[([^\]]+)\]$/);
    if (h) {
      section = h[1].trim();
      out[section] ??= {};
      return;
    }
    const kv = line.match(/^([^=:]+?)\s*[=:]\s*(.*)$/);
    if (!kv) return errors.push(`Line ${i + 1}: expected key = value`);
    if (!section) return errors.push(`Line ${i + 1}: key outside of a [section]`);
    out[section][kv[1].trim()] = kv[2].trim();
  });
  return { data: out, errors };
}

/** Write a custom .fact file and see where its values appear in ansible_facts. */
export default function CustomFactBuilder() {
  const [file, setFile] = useState('custom');
  const [text, setText] = useState(START);
  const { data, errors } = useMemo(() => parseIni(text), [text]);
  const name = file.replace(/\.fact$/, '').replace(/[^A-Za-z0-9_]/g, '_') || 'custom';
  const first = Object.keys(data)[0];
  const firstKey = first && Object.keys(data[first])[0];

  return (
    <div className="widget cfb">
      <Diagram width={680} height={96} title="Custom fact flow" expandable={false}>
        <Node x={4} y={14} w={206} h={68} tone="amber" title={`${name}.fact`} sub={['/etc/ansible/facts.d/', 'on the managed host']} mono />
        <Arrow
          points={[
            [210, 48],
            [256, 48],
          ]}
          label="read by"
        />
        <Node x={258} y={20} w={140} h={56} tone="teal" title="setup" sub="Gathering Facts" />
        <Arrow
          points={[
            [398, 48],
            [444, 48],
          ]}
        />
        <Node
          x={446}
          y={20}
          w={230}
          h={56}
          tone="purple"
          title={`ansible_facts['ansible_local']`}
          sub={`['${name}'][section][key]`}
          mono
          titleSize={11.5}
        />
      </Diagram>

      <div className="cfb-grid">
        <div>
          <label className="cfb-file">
            <span className="widget-label">File name</span>
            <span className="cfb-path">
              /etc/ansible/facts.d/
              <input value={file} onChange={(e) => setFile(e.target.value)} spellCheck={false} aria-label="Fact file name" />
              .fact
            </span>
          </label>
          <textarea
            className="cfb-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Custom fact file content (INI)"
          />
          {errors.length > 0 && <p className="dx-warn">{errors[0]}</p>}
        </div>
        <DataExplorer
          key={name + Object.keys(data).join()}
          name="ansible_facts"
          data={{ ansible_local: { [name]: data } }}
          initial={first && firstKey ? ['ansible_local', name, first, firstKey] : ['ansible_local', name]}
        />
      </div>
    </div>
  );
}
