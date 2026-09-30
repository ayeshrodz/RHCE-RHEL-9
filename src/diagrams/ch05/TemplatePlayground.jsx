import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { render } from '@/lib/jinja';
import { useLabEnv } from '@/lib/labEnv';

const HOSTS = {
  'servera.lab.example.com': { hostname: 'servera', ip: '172.25.250.10', mem: 960, cpus: 1 },
  'serverb.lab.example.com': { hostname: 'serverb', ip: '172.25.250.11', mem: 1960, cpus: 2 },
  'workstation.lab.example.com': { hostname: 'workstation', ip: '172.25.250.9', mem: 3900, cpus: 2 },
};

const PRESETS = [
  {
    id: 'motd',
    label: 'Variables and facts',
    template: `{# /etc/motd: this comment never reaches the file #}
This is the system {{ ansible_facts['fqdn'] }}.
This is a {{ ansible_facts['distribution'] }} version {{ ansible_facts['distribution_version'] }} system.
Only use this system with permission.
Please report issues to: {{ system_owner }}.
`,
  },
  {
    id: 'for',
    label: 'for loop',
    template: `# {{ ansible_managed }}
{% for host in groups['all'] %}
{{ hostvars[host]['ansible_facts']['default_ipv4']['address'] }} {{ hostvars[host]['ansible_facts']['fqdn'] }} {{ hostvars[host]['ansible_facts']['hostname'] }}
{% endfor %}
`,
  },
  {
    id: 'forif',
    label: 'for with a condition',
    template: `{# every user except root #}
{% for myuser in users if not myuser == "root" %}
User number {{ loop.index }} - {{ myuser }}
{% endfor %}
`,
  },
  {
    id: 'if',
    label: 'if / else',
    template: `{% if ansible_facts['memtotal_mb'] >= 1024 %}
MaxClients 200
{% else %}
MaxClients 50   # small host: {{ ansible_facts['memtotal_mb'] }} MiB
{% endif %}
{% if inventory_hostname in groups['webservers'] %}
Role: web server
{% endif %}
`,
  },
  {
    id: 'filters',
    label: 'Filters',
    template: `Owner: {{ system_owner | upper }}
Users: {{ users | join(', ') }} ({{ users | length }} in total)
Backup host: {{ backup_host | default('none configured') }}

as JSON: {{ users | to_json }}
as YAML:
{{ users | to_nice_yaml }}
`,
  },
];

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
    ansible_managed: 'Ansible managed',
    system_owner: 'clyde@example.com',
    users: ['root', 'jane', 'joe', 'sara'],
  };
}

/** Edit a Jinja2 template and see the file each host would receive. */
export default function TemplatePlayground() {
  const [env] = useLabEnv();
  const [preset, setPreset] = useState('motd');
  const [template, setTemplate] = useState(PRESETS[0].template);
  const [host, setHost] = useState('servera.lab.example.com');
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
        <p className="widget-label">Template playground</p>
        <div className="segmented" role="radiogroup" aria-label="Example template">
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
        Edit the template on the left. The right side is the file the <code>template</code> module would write on the chosen host. Available
        here: <code>ansible_facts</code>, <code>hostvars</code>, <code>groups</code>, <code>inventory_hostname</code>,{' '}
        <code>system_owner</code> and <code>users</code>.
      </p>

      <div className="tpl-grid">
        <div>
          <div className="tpl-bar">
            <span className="tpl-file">templates/example.j2</span>
            {template !== original && (
              <button className="btn btn-sm btn-ghost" onClick={() => setTemplate(original)}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
          <textarea
            className="tpl-editor"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            spellCheck={false}
            rows={Math.max(5, template.split('\n').length + 1)}
            aria-label="Jinja2 template"
          />
        </div>
        <div>
          <div className="tpl-bar">
            <span className="tpl-file">rendered on</span>
            <div className="segmented" role="radiogroup" aria-label="Managed host">
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
            <pre
              className="terminal tpl-out is-error"
              aria-live="polite"
            >{`fatal: [${HOSTS[host].hostname}]: FAILED!\nAnsibleError: ${result.error}`}</pre>
          ) : (
            <pre className="terminal tpl-out" aria-live="polite">
              {result.text || ' '}
            </pre>
          )}
          <p className="tpl-foot">
            Facts shown are for {env === 'home' ? 'the home lab (Rocky Linux)' : 'the Red Hat classroom (RHEL)'}. A variable that is not
            defined stops the task, as it does in Ansible.
          </p>
        </div>
      </div>
    </div>
  );
}
