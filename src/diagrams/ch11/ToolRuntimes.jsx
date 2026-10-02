import { useState } from 'react';
import { Arrow, Diagram, Group, InfoPanel, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('ToolRuntimes', (copy) => {
  const info = copy.data.info;
  const subs = copy.data.subs;

  function ToolRuntimes() {
    const [sel, setSel] = useState(null);
    const pick = (k) => () => setSel((s) => (s === k ? null : k));
    const n = (k) => ({ active: sel === k, dim: sel && sel !== k, onClick: pick(k) });
    const runtimes = [
      ['installed', 46, 'gray', copy.text.installed],
      ['devcontainer', 126, 'teal', copy.text.devcontainer],
      ['ee', 206, 'blue', copy.text.ee],
    ];

    return (
      <Diagram
        height={292}
        title={copy.text.title}
        caption={copy.text.caption}
        below={<InfoPanel item={info[sel]} hint={copy.text.hint} />}
      >
        <Group x={10} y={10} w={500} h={272} tone="gray" label={copy.text.label} />
        <Group x={530} y={10} w={140} h={272} tone="green" label={copy.text.label2} />

        <Node x={26} y={46} w={156} h={106} tone="amber" title={copy.text.project} sub={subs.project} {...n('project')} />
        <Node x={26} y={166} w={156} h={106} tone="purple" title={copy.text.editor} sub={subs.editor} {...n('editor')} />

        {runtimes.map(([key, y, tone, title]) => (
          <Node key={key} x={204} y={y} w={168} h={66} tone={tone} title={title} sub={subs[key]} {...n(key)} />
        ))}
        {runtimes.map(([key, y]) => (
          <Arrow
            key={key}
            points={[
              [374, y + 33],
              [544, y + 33],
            ]}
            label="SSH"
            hot={sel === key}
            dim={sel && sel !== key && sel !== 'hosts'}
          />
        ))}

        <Node x={546} y={46} w={110} h={226} tone="green" title={copy.text.hosts} sub={subs.hosts} {...n('hosts')} />
      </Diagram>
    );
  }
  return ToolRuntimes;
});
