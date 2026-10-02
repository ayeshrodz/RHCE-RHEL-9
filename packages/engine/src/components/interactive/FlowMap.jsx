import { useState } from 'react';
import { Arrow, Diagram, InfoPanel, Node } from '@/diagrams/kit';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import OptionSwitch from './OptionSwitch';

/** A responsive sequence diagram. Labels and explanations are authored in content. */
export default function FlowMap({ title, caption, steps, connections = [] }) {
  const [selected, setSelected] = useState(steps[0].id);
  const narrow = useMediaQuery('(max-width: 640px)');
  const width = narrow ? 360 : 680;
  const gap = 64;
  const nodeWidth = narrow ? 328 : (width - 16 - gap * (steps.length - 1)) / steps.length;
  const position = (i) => (narrow ? { x: 16, y: 8 + i * 128 } : { x: 8 + i * (nodeWidth + gap), y: 8 });
  const current = steps.find((step) => step.id === selected) ?? steps[0];
  return (
    <Diagram
      width={width}
      height={narrow ? steps.length * 128 - 40 : 88}
      title={title}
      caption={caption}
      expandable={false}
      below={
        <>
          <OptionSwitch
            className="flow-map-options"
            label={`${title}: choose a step`}
            value={current.id}
            onChange={setSelected}
            options={steps.map((step) => ({ value: step.id, label: step.title }))}
          />
          <InfoPanel item={current} />
        </>
      }
    >
      {steps.map((step, i) => {
        const { x, y } = position(i);
        const next = position(i + 1);
        return (
          <g key={step.id}>
            <Node
              x={x}
              y={y}
              w={nodeWidth}
              h={72}
              title={step.title}
              sub={step.sub}
              tone={step.tone}
              active={step.id === current.id}
              onClick={() => setSelected(step.id)}
            />
            {i < steps.length - 1 && (
              <Arrow
                points={
                  narrow
                    ? [
                        [x + nodeWidth / 2, y + 74],
                        [x + nodeWidth / 2, next.y - 2],
                      ]
                    : [
                        [x + nodeWidth + 2, y + 36],
                        [next.x - 2, y + 36],
                      ]
                }
                label={connections[i]}
                labelDx={narrow ? 12 : 0}
                labelDy={narrow ? 4 : -7}
                labelAnchor={narrow ? 'start' : 'middle'}
              />
            )}
          </g>
        );
      })}
    </Diagram>
  );
}
