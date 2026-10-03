import { useState } from 'react';
import { Arrow, Badge, Diagram, Group, InfoPanel, Label, Node, StepControls, useStepper } from '@/diagrams/kit';
import { usePlaceholderValues } from '@/lib/placeholders';

const flag = (value, view) => value === true || (Array.isArray(value) && value.includes(view));

/** The value of a property for the current view: a per-view override if there is one, else the element's own. */
function pick(element, prop, view) {
  const overrides = element.overrides?.[prop];
  return overrides && Object.hasOwn(overrides, String(view)) ? overrides[String(view)] : element[prop];
}

/**
 * Draws a diagram from its data: boxes, groups, arrows and labels on a fixed canvas.
 * The view is a step number (steps mode) or the selected box (select mode); each element
 * says in which views it is highlighted, accented or faded.
 */
export default function SpecDiagram({ spec }) {
  const mode = spec.mode ?? 'static';
  const stepper = useStepper(spec.steps?.length ?? 1);
  const [selected, setSelected] = useState(spec.initial ?? null);
  const [labValues] = usePlaceholderValues();
  const view = mode === 'steps' ? stepper.step : mode === 'select' ? selected : null;
  // A diagram that opens with a box selected always keeps one selected; otherwise a second click clears it.
  const choose = (key) => () => setSelected((current) => (spec.initial || current !== key ? key : null));
  const fill = (text) => (typeof text === 'string' ? text.replace(/<(\w+)>/g, (match, key) => labValues[key]?.trim() || match) : text);

  const state = (element) => ({
    active: flag(element.active, view),
    dim: element.dim === true || (view !== null && element.visible !== undefined && !element.visible.includes(view)),
  });

  const draw = (element, index) => {
    const common = { key: index };
    switch (element.kind) {
      case 'node': {
        const { active, dim } = state(element);
        return (
          <Node
            {...common}
            x={element.x}
            y={element.y}
            w={element.w}
            h={element.h}
            tone={element.tone}
            title={pick(element, 'title', view)}
            sub={fill(pick(element, 'sub', view))}
            mono={element.mono}
            rx={element.rx}
            titleSize={element.titleSize}
            align={element.align}
            active={active}
            dim={dim}
            onClick={element.select ? choose(element.select) : undefined}
          />
        );
      }
      case 'group': {
        const { active, dim } = state(element);
        const group = (
          <Group
            {...common}
            x={element.x}
            y={element.y}
            w={element.w}
            h={element.h}
            tone={element.tone}
            label={pick(element, 'label', view)}
            sub={element.sub}
            solid={element.solid}
            active={active}
            dim={dim}
          />
        );
        if (!element.select) return group;
        const select = choose(element.select);
        return (
          <g
            {...common}
            className="dg-group-select"
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={pick(element, 'label', view)}
            onClick={select}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), select())}
          >
            {group}
          </g>
        );
      }
      case 'arrow': {
        const { dim } = state(element);
        return (
          <Arrow
            {...common}
            points={element.points}
            label={pick(element, 'label', view)}
            labelAt={element.labelAt}
            labelDx={element.labelDx}
            labelDy={element.labelDy}
            labelAnchor={element.labelAnchor}
            variant={element.variant}
            both={element.both}
            dashed={pick(element, 'dashed', view)}
            hot={flag(element.hot, view)}
            dim={dim}
          />
        );
      }
      case 'label':
        return (
          <Label
            {...common}
            x={element.x}
            y={element.y}
            anchor={element.anchor}
            size={element.size}
            weight={element.weight}
            mono={element.mono}
            muted={pick(element, 'muted', view)}
          >
            {pick(element, 'text', view)}
          </Label>
        );
      case 'badge':
        return <Badge {...common} x={element.x} y={element.y} n={pick(element, 'n', view)} hot={flag(element.hot, view)} />;
      default:
        return null;
    }
  };

  const below =
    mode === 'steps' ? (
      <StepControls stepper={stepper} steps={spec.steps} />
    ) : mode === 'select' ? (
      <InfoPanel item={spec.info?.[selected]} hint={spec.hint} />
    ) : undefined;

  return (
    <Diagram width={spec.width} height={spec.height} title={spec.title} caption={spec.caption} expandable={spec.expandable} below={below}>
      {spec.elements.map(draw)}
    </Diagram>
  );
}
