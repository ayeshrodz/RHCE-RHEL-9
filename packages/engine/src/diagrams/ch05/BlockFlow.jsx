import { useState } from 'react';
import { Arrow, Diagram, Group, Label, Node } from '../kit';
import { defineWidget } from '@/components/interactive/TeachingContent';

export default defineWidget('BlockFlow', (copy) => {
  function BlockFlow() {
    const [blockFails, setBlockFails] = useState(true);
    const [rescueFails, setRescueFails] = useState(false);

    const rescueRuns = blockFails;
    const hostFailed = blockFails && rescueFails;
    const outcome = !blockFails
      ? { tone: 'green', title: copy.text.title, sub: copy.text.sub }
      : !rescueFails
        ? { tone: 'green', title: copy.text.title2, sub: copy.text.sub2 }
        : { tone: 'red', title: copy.text.title3, sub: copy.text.sub3 };

    const controls = (
      <div className="bf-controls">
        <label className="vsub-toggle">
          <input type="checkbox" checked={blockFails} onChange={(e) => setBlockFails(e.target.checked)} />
          {copy.text.vsubToggle}
        </label>
        <label className={`vsub-toggle ${blockFails ? '' : 'is-disabled'}`}>
          <input type="checkbox" checked={rescueFails} disabled={!blockFails} onChange={(e) => setRescueFails(e.target.checked)} />
          {copy.text.label}
        </label>
      </div>
    );

    return (
      <Diagram height={250} title={copy.text.title4} caption={copy.text.caption} below={controls} expandable={false}>
        <Group x={8} y={10} w={200} h={150} tone="blue" label={copy.text.label2} active />
        <Node x={24} y={46} w={168} h={44} tone="blue" title={copy.text.title5} titleSize={12.5} />
        <Node
          x={24}
          y={100}
          w={168}
          h={44}
          tone={blockFails ? 'red' : 'green'}
          title={blockFails ? copy.text.title6 : copy.text.title7}
          titleSize={12.5}
        />

        <Group x={250} y={10} w={200} h={150} tone="amber" label={copy.text.label3} active={rescueRuns} dim={!rescueRuns} />
        <Node x={266} y={46} w={168} h={44} tone="amber" title={copy.text.title8} titleSize={12.5} dim={!rescueRuns} />
        <Node
          x={266}
          y={100}
          w={168}
          h={44}
          tone={!rescueRuns ? 'gray' : rescueFails ? 'red' : 'green'}
          title={!rescueRuns ? copy.text.title9 : rescueFails ? copy.text.title10 : copy.text.title11}
          titleSize={12.5}
          dim={!rescueRuns}
        />

        <Group x={492} y={10} w={180} h={150} tone="teal" label={copy.text.label4} active />
        <Node x={508} y={46} w={148} h={44} tone="teal" title={copy.text.title12} titleSize={12.5} />
        <Node x={508} y={100} w={148} h={44} tone="teal" title={copy.text.title13} titleSize={12.5} />

        <Arrow
          points={[
            [208, 85],
            [248, 85],
          ]}
          label={copy.text.label5}
          hot={blockFails}
          dim={!blockFails}
        />
        <Arrow
          points={[
            [108, 160],
            [108, 190],
            [582, 190],
            [582, 162],
          ]}
          label={copy.text.label6}
          labelAt={0.25}
          hot={!blockFails}
          dim={blockFails}
        />
        <Arrow
          points={[
            [450, 85],
            [490, 85],
          ]}
          hot={rescueRuns}
          dim={!rescueRuns}
        />

        <Node x={236} y={206} w={228} h={40} tone={outcome.tone} title={outcome.title} sub={outcome.sub} titleSize={13} />
        <Label x={582} y={240} muted size={11.5}>
          {hostFailed ? 'failed=1' : blockFails ? 'rescued=1' : 'failed=0'}
        </Label>
      </Diagram>
    );
  }
  return BlockFlow;
});
