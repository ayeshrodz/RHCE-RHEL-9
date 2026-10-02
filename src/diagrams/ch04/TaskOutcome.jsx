import { useState } from 'react';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('TaskOutcome', (copy) => {
  const OUTPUTS = copy.data.outputs;

  const FAILED_WHEN = [
    { label: copy.text.label, expr: null, eval: null },
    {
      label: copy.text.label2,
      expr: copy.text.expr,
      eval: (rc, out) => out.includes('Password missing'),
    },
    { label: 'false', expr: 'false', eval: () => false },
  ];

  const CHANGED_WHEN = [
    { label: copy.text.label3, expr: null, eval: null },
    { label: 'false', expr: 'false', eval: () => false },
    { label: copy.text.label4, expr: copy.text.expr2, eval: (rc, out) => out.includes('Success') },
  ];

  function TaskOutcome() {
    const [rc, setRc] = useState(0);
    const [out, setOut] = useState(OUTPUTS[1]);
    const [fw, setFw] = useState(0);
    const [cw, setCw] = useState(0);
    const [ignore, setIgnore] = useState(false);

    const failedRule = FAILED_WHEN[fw];
    const changedRule = CHANGED_WHEN[cw];
    // command module defaults: non-zero rc means failed; otherwise always "changed".
    const failed = failedRule.eval ? failedRule.eval(rc, out) : rc !== 0;
    const changed = !failed && (changedRule.eval ? changedRule.eval(rc, out) : true);
    const status = failed ? (ignore ? copy.text.label5 : 'failed') : changed ? 'changed' : 'ok';

    const yaml = [
      copy.text.label6,
      copy.text.label7,
      copy.text.label8,
      failedRule.expr && formatCopy(copy.text.template, [failedRule.expr]),
      changedRule.expr && formatCopy(copy.text.template2, [changedRule.expr]),
      ignore && copy.text.label9,
      copy.text.label10,
    ]
      .filter(Boolean)
      .join('\n');

    const recap = {
      ok: failed ? 0 : 1,
      changed: changed ? 1 : 0,
      failed: failed && !ignore ? 1 : 0,
      ignored: failed && ignore ? 1 : 0,
    };

    return (
      <div className="widget to">
        <div className="to-grid">
          <div className="to-inputs">
            <p className="widget-label">{copy.text.widgetLabel}</p>
            <div className="to-row">
              <span>{copy.text.span}</span>
              <div className="segmented">
                {[0, 1].map((v) => (
                  <button key={v} className={rc === v ? 'is-active' : ''} onClick={() => setRc(v)}>
                    {copy.text.button}
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="to-row">
              <span>{copy.text.span2}</span>
              <select value={out} onChange={(e) => setOut(e.target.value)} aria-label={copy.text.label11}>
                {OUTPUTS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <p className="widget-label to-gap">{copy.text.widgetLabel2}</p>
            <div className="to-row">
              <span>{copy.text.span3}</span>
              <select value={fw} onChange={(e) => setFw(Number(e.target.value))} aria-label={copy.text.label12}>
                {FAILED_WHEN.map((o, i) => (
                  <option key={o.label} value={i}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="to-row">
              <span>{copy.text.span4}</span>
              <select value={cw} onChange={(e) => setCw(Number(e.target.value))} aria-label={copy.text.label13}>
                {CHANGED_WHEN.map((o, i) => (
                  <option key={o.label} value={i}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="vsub-toggle to-ignore">
              <input type="checkbox" checked={ignore} onChange={(e) => setIgnore(e.target.checked)} />
              {copy.text.vsubToggle}
            </label>
          </div>

          <div>
            <pre className="terminal to-yaml">{yaml}</pre>
            <div className={`to-result is-${failed ? (ignore ? 'ignored' : 'failed') : changed ? 'changed' : 'ok'}`} aria-live="polite">
              <p className="to-status">{status}</p>
              <ul>
                <li>{failed && !ignore ? copy.text.label14 : copy.text.label15}</li>
                <li>{changed ? copy.text.label16 : copy.text.label17}</li>
              </ul>
              <p className="to-recap">
                {copy.text.toRecap}
                {recap.ok}
                {copy.text.toRecap2}
                {recap.changed}
                {copy.text.toRecap3}
                {recap.failed}
                {copy.text.toRecap4}
                {recap.ignored}
              </p>
            </div>
          </div>
        </div>
        <p className="widget-caption">{copy.text.widgetCaption}</p>
      </div>
    );
  }
  return TaskOutcome;
});
