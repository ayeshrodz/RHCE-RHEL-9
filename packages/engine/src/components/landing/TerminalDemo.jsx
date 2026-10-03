import { useInView } from './useInView';

const PROMPT = { command: '$', output: '', ok: '✔', changed: '~', comment: '#' };

/** A terminal that types its commands and shows their results one after another once it is in view. */
export default function TerminalDemo({ title, lines }) {
  const [ref, seen] = useInView(0.35);
  let clock = 0.3;
  const timed = lines.map((line) => {
    const start = clock;
    clock += line.kind === 'command' ? 0.3 + line.text.length * 0.04 : 0.28;
    return { ...line, start, typing: line.kind === 'command' ? line.text.length * 0.04 : 0 };
  });
  return (
    <figure ref={ref} className={`td ${seen ? 'is-playing' : ''}`}>
      <div className="td-bar" aria-hidden="true">
        <span className="td-dot td-r" />
        <span className="td-dot td-y" />
        <span className="td-dot td-g" />
        <span className="td-title">{title}</span>
      </div>
      <div className="td-body" role="img" aria-label={lines.map((l) => l.text).join('. ')}>
        {timed.map((line, i) => (
          <div
            key={i}
            className={`td-line td-${line.kind}`}
            style={{ '--at': `${line.start}s`, '--type': `${line.typing}s`, '--n': line.text.length }}
          >
            {PROMPT[line.kind] && <span className="td-prompt">{PROMPT[line.kind]}</span>}
            <span className={line.kind === 'command' ? 'td-typed' : 'td-text'}>{line.text}</span>
          </div>
        ))}
        <div className="td-line td-command" style={{ '--at': `${clock}s` }}>
          <span className="td-prompt">$</span>
          <span className="td-cursor" />
        </div>
      </div>
    </figure>
  );
}
