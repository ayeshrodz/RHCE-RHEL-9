import { useState } from 'react';
import { Arrow, Diagram, Group, Label, Node } from '../kit';

/** Toggle failures inside block and rescue and follow the path Ansible takes. */
export default function BlockFlow() {
  const [blockFails, setBlockFails] = useState(true);
  const [rescueFails, setRescueFails] = useState(false);

  const rescueRuns = blockFails;
  const hostFailed = blockFails && rescueFails;
  const outcome = !blockFails
    ? { tone: 'green', title: 'Play continues', sub: 'rescue was skipped' }
    : !rescueFails
      ? { tone: 'green', title: 'Play continues', sub: 'recovered · rescued=1' }
      : { tone: 'red', title: 'Host fails', sub: 'after always has run' };

  const controls = (
    <div className="bf-controls">
      <label className="vsub-toggle">
        <input type="checkbox" checked={blockFails} onChange={(e) => setBlockFails(e.target.checked)} /> a task in block fails
      </label>
      <label className={`vsub-toggle ${blockFails ? '' : 'is-disabled'}`}>
        <input type="checkbox" checked={rescueFails} disabled={!blockFails} onChange={(e) => setRescueFails(e.target.checked)} /> rescue
        also fails
      </label>
    </div>
  );

  return (
    <Diagram
      height={250}
      title="block, rescue and always"
      caption="rescue runs only if something in block failed. always follows ordinary task outcomes. Unreachable hosts and invalid tasks are exceptions."
      below={controls}
      expandable={false}
    >
      <Group x={8} y={10} w={200} h={150} tone="blue" label="block:" active />
      <Node x={24} y={46} w={168} h={44} tone="blue" title="upgrade the database" titleSize={12.5} />
      <Node
        x={24}
        y={100}
        w={168}
        h={44}
        tone={blockFails ? 'red' : 'green'}
        title={blockFails ? '✗ task failed' : '✓ all tasks ok'}
        titleSize={12.5}
      />

      <Group x={250} y={10} w={200} h={150} tone="amber" label="rescue:" active={rescueRuns} dim={!rescueRuns} />
      <Node x={266} y={46} w={168} h={44} tone="amber" title="revert the upgrade" titleSize={12.5} dim={!rescueRuns} />
      <Node
        x={266}
        y={100}
        w={168}
        h={44}
        tone={!rescueRuns ? 'gray' : rescueFails ? 'red' : 'green'}
        title={!rescueRuns ? 'skipped' : rescueFails ? '✗ rescue failed' : '✓ recovered'}
        titleSize={12.5}
        dim={!rescueRuns}
      />

      <Group x={492} y={10} w={180} h={150} tone="teal" label="always:" active />
      <Node x={508} y={46} w={148} h={44} tone="teal" title="restart the database" titleSize={12.5} />
      <Node x={508} y={100} w={148} h={44} tone="teal" title="✓ cleanup runs" titleSize={12.5} />

      <Arrow
        points={[
          [208, 85],
          [248, 85],
        ]}
        label="on failure"
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
        label="no failure: skip rescue"
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
