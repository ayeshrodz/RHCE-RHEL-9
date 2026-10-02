import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('ConditionPlayground', (copy) => {
  const HOSTS = copy.data.hosts;

  const PRESETS = [
    {
      expr: copy.text.expr,
      test: (h) => h.distribution === 'RedHat',
      note: copy.text.note,
    },
    {
      expr: copy.text.expr2,
      test: (h) => h.mem >= 2048,
      note: copy.text.note2,
    },
    {
      expr: copy.text.expr3,
      test: (h) => 'my_service' in h.vars,
      note: copy.text.note3,
    },
    {
      expr: copy.text.expr4,
      vars: copy.text.vars,
      test: () => true,
      note: copy.text.note4,
    },
    {
      expr: copy.text.expr5,
      test: (h) => h.distribution === 'RedHat' && h.mem > 1024,
      note: copy.text.note5,
    },
    {
      expr: copy.text.expr6,
      full: copy.text.full,
      test: (h) => (h.distribution === 'RedHat' && h.major === '9') || (h.distribution === 'Fedora' && h.major === '34'),
      note: copy.text.note6,
    },
    {
      expr: 'run_my_task',
      vars: copy.text.vars2,
      test: () => true,
      trap: true,
      note: copy.text.note7,
    },
    {
      expr: copy.text.expr7,
      vars: copy.text.vars3,
      test: () => false,
      note: copy.text.note8,
    },
  ];

  function ConditionPlayground() {
    const [sel, setSel] = useState(0);
    const p = PRESETS[sel];

    return (
      <div className="widget cp">
        <p className="widget-label">{copy.text.widgetLabel}</p>
        <div className="cp-presets">
          {PRESETS.map((x, i) => (
            <button
              key={x.expr}
              className={`cp-preset ${i === sel ? 'is-active' : ''} ${x.trap ? 'is-trap' : ''}`}
              onClick={() => setSel(i)}
            >
              <code>{x.expr}</code>
            </button>
          ))}
        </div>

        <pre className="terminal cp-task">
          {p.vars ? formatCopy(copy.text.template, [p.vars]) : ''}
          {formatCopy(copy.text.template2, [p.full ?? p.expr])}
        </pre>
        <p className={`cp-note ${p.trap ? 'is-trap' : ''}`}>{p.note}</p>

        <div className="cp-hosts" aria-live="polite">
          {HOSTS.map((h) => {
            const run = p.test(h);
            return (
              <div key={h.name} className={`cp-host ${run ? 'is-run' : 'is-skip'}`}>
                <p className="cp-host-name">{h.name}</p>
                <dl>
                  <dt>{copy.text.dt}</dt>
                  <dd>
                    {h.distribution} {h.version}
                  </dd>
                  <dt>{copy.text.dt2}</dt>
                  <dd>{h.mem}</dd>
                  <dt>{copy.text.dt3}</dt>
                  <dd>{h.vars.my_service ?? <em>{copy.text.em}</em>}</dd>
                </dl>
                <p className="cp-verdict">{run ? formatCopy(copy.text.template3, [h.name]) : formatCopy(copy.text.template4, [h.name])}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return ConditionPlayground;
});
