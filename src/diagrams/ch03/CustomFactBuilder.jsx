import CodeEditor from '@/components/interactive/CodeEditor';
import { useMemo, useState } from 'react';
import DataExplorer from './DataExplorer';
import { Arrow, Diagram, Node } from '../kit';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('CustomFactBuilder', (copy) => {
  const START = copy.data.start;

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
      if (!kv) return errors.push(formatCopy(copy.text.template, [i + 1]));
      if (!section) return errors.push(formatCopy(copy.text.template2, [i + 1]));
      out[section][kv[1].trim()] = kv[2].trim();
    });
    return { data: out, errors };
  }

  function CustomFactBuilder() {
    const [file, setFile] = useState(copy.data.initialSelection1);
    const [text, setText] = useState(START);
    const { data, errors } = useMemo(() => parseIni(text), [text]);
    const name = file.replace(/\.fact$/, '').replace(/[^A-Za-z0-9_]/g, '_') || 'custom';
    const first = Object.keys(data)[0];
    const firstKey = first && Object.keys(data[first])[0];

    return (
      <div className="widget cfb">
        <Diagram width={680} height={96} title={copy.text.title} expandable={false}>
          <Node x={4} y={14} w={206} h={68} tone="amber" title={`${name}.fact`} sub={[copy.text.sub, copy.text.sub2]} mono />
          <Arrow
            points={[
              [210, 48],
              [256, 48],
            ]}
            label={copy.text.label}
          />
          <Node x={258} y={20} w={140} h={56} tone="teal" title={copy.text.title2} sub={copy.text.sub3} />
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
              <span className="widget-label">{copy.text.widgetLabel}</span>
              <span className="cfb-path">
                {copy.text.cfbPath}
                <input value={file} onChange={(e) => setFile(e.target.value)} spellCheck={false} aria-label={copy.text.label2} />
                {copy.text.cfbPath2}
              </span>
            </label>
            <CodeEditor
              className="cfb-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              aria-label={copy.text.label3}
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
  return CustomFactBuilder;
});
