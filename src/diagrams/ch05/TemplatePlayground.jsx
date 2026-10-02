import CodeEditor from '@/components/interactive/CodeEditor';
import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { render } from '@/lib/jinja';
import { useLabEnv } from '@/lib/labEnv';
import { defineWidget, formatCopy } from '@/components/interactive/TeachingContent';

export default defineWidget('TemplatePlayground', (copy) => {
  const HOSTS = copy.data.hosts;

  const PRESETS = copy.data.presets;

  function contextFor(host, env) {
    const distro =
      env === 'home' ? { distribution: 'Rocky', distribution_version: '9.8' } : { distribution: 'RedHat', distribution_version: '9.0' };
    const facts = (name) => {
      const h = HOSTS[name];
      return {
        fqdn: name,
        hostname: h.hostname,
        ...distro,
        os_family: 'RedHat',
        default_ipv4: { address: h.ip, interface: 'eth0' },
        memtotal_mb: h.mem,
        processor_count: h.cpus,
      };
    };
    return {
      inventory_hostname: host,
      ansible_facts: facts(host),
      hostvars: Object.fromEntries(Object.keys(HOSTS).map((n) => [n, { ansible_facts: facts(n) }])),
      groups: {
        all: Object.keys(HOSTS),
        webservers: ['servera.lab.example.com', 'serverb.lab.example.com'],
        workstations: ['workstation.lab.example.com'],
      },
      ansible_managed: copy.text.ansiblemanaged,
      system_owner: 'clyde@example.com',
      users: ['root', 'jane', 'joe', 'sara'],
    };
  }

  function TemplatePlayground() {
    const [env] = useLabEnv();
    const [preset, setPreset] = useState(copy.data.initialSelection1);
    const [template, setTemplate] = useState(PRESETS[0].template);
    const [host, setHost] = useState(copy.data.initialSelection2);
    const original = PRESETS.find((p) => p.id === preset).template;

    const result = useMemo(() => {
      try {
        return { text: render(template, contextFor(host, env)) };
      } catch (e) {
        return { error: e.message };
      }
    }, [template, host, env]);

    const pick = (p) => {
      setPreset(p.id);
      setTemplate(p.template);
    };

    return (
      <div className="widget tpl">
        <div className="verb-head">
          <p className="widget-label">{copy.text.widgetLabel}</p>
          <div className="segmented" role="radiogroup" aria-label={copy.text.label}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={preset === p.id}
                className={preset === p.id ? 'is-active' : ''}
                onClick={() => pick(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="widget-sub">
          {copy.text.widgetSub}
          <code>{copy.text.code}</code>
          {copy.text.widgetSub2}
          <code>{copy.text.code2}</code>
          {copy.text.widgetSub3}
          <code>{copy.text.code3}</code>
          {copy.text.widgetSub4}
          <code>{copy.text.code4}</code>
          {copy.text.widgetSub5}
          <code>{copy.text.code5}</code>
          {copy.text.widgetSub6} <code>{copy.text.code6}</code>
          {copy.text.widgetSub7}
          <code>{copy.text.code7}</code>
          {copy.text.widgetSub8}
        </p>

        <div className="tpl-grid">
          <div>
            <div className="tpl-bar">
              <span className="tpl-file">{copy.text.tplFile}</span>
              {template !== original && (
                <button className="btn btn-sm btn-ghost" onClick={() => setTemplate(original)}>
                  <RotateCcw size={12} />
                  {copy.text.btn}
                </button>
              )}
            </div>
            <CodeEditor
              className="tpl-editor"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              spellCheck={false}
              rows={Math.max(5, template.split('\n').length + 1)}
              aria-label={copy.text.label2}
            />
          </div>
          <div>
            <div className="tpl-bar">
              <span className="tpl-file">{copy.text.tplFile2}</span>
              <div className="segmented" role="radiogroup" aria-label={copy.text.label3}>
                {Object.entries(HOSTS).map(([name, h]) => (
                  <button
                    key={name}
                    role="radio"
                    aria-checked={host === name}
                    className={host === name ? 'is-active' : ''}
                    onClick={() => setHost(name)}
                  >
                    {h.hostname}
                  </button>
                ))}
              </div>
            </div>
            {result.error ? (
              <pre className="terminal tpl-out is-error" aria-live="polite">
                {formatCopy(copy.text.template, [HOSTS[host].hostname, result.error])}
              </pre>
            ) : (
              <pre className="terminal tpl-out" aria-live="polite">
                {result.text || ' '}
              </pre>
            )}
            <p className="tpl-foot">
              {copy.text.tplFoot}
              {env === 'home' ? copy.text.label4 : copy.text.label5}
              {copy.text.tplFoot2}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return TemplatePlayground;
});
