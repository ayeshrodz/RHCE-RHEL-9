import { useRef, useState } from 'react';
import { Check, Copy, SquareTerminal, FileCode2, WrapText } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { interfaceContent } from '@/lib/course';
import { fillCodeTree, usePlaceholderValues } from '@/lib/placeholders';

const langLabel = {
  yaml: 'YAML',
  yml: 'YAML',
  ini: 'INI',
  json: 'JSON',
  bash: 'Shell',
  sh: 'Shell',
  console: 'Terminal',
  shellsession: 'Terminal',
  text: 'Output',
  jinja: 'Jinja2',
  python: 'Python',
};

const TERMINAL = new Set(['console', 'shellsession']);
const PROMPT = /^(?:\[[^\]]*\][$#]|[$#])\s?/;

/** For terminal sessions, copy just the commands (prompts stripped, output dropped). */
function commandsOnly(text) {
  const out = [];
  let continuing = false;
  for (const line of text.split('\n')) {
    if (PROMPT.test(line)) {
      out.push(line.replace(PROMPT, ''));
      continuing = line.trimEnd().endsWith('\\');
    } else if (continuing) {
      out.push(line.replace(/^>\s?/, ''));
      continuing = line.trimEnd().endsWith('\\');
    }
  }
  return out.length ? out.join('\n') : text;
}

export default function CodeBlock({ children, className = '', style, 'data-title': title, 'data-lang': lang, ...rest }) {
  const [labValues] = usePlaceholderValues();
  const preRef = useRef(null);
  const mobile = useMediaQuery('(max-width: 640px)');
  const [wrapOverride, setWrapOverride] = useState(null);
  const wrapped = wrapOverride ?? mobile;
  const copyLabels = interfaceContent.CodeBlock.text;
  const [copied, setCopied] = useState(false);
  const terminal = TERMINAL.has(lang);
  const label = title ?? langLabel[lang] ?? lang ?? copyLabels.fallback;

  const copy = async () => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(terminal ? commandsOnly(text) : text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const Icon = terminal ? SquareTerminal : FileCode2;

  return (
    <div className={`code-block ${terminal ? 'is-terminal' : ''} ${wrapped ? 'is-wrapped' : ''}`}>
      <div className="code-head">
        <span className="code-label">
          <Icon size={13} />
          <span className={title ? 'is-file' : ''}>{label}</span>
          {title && lang && langLabel[lang] && <span className="code-lang">{langLabel[lang]}</span>}
        </span>
        <div className="code-actions">
          {mobile && (
            <button
              className="code-copy code-wrap"
              aria-label={copyLabels.wrap}
              aria-pressed={wrapped}
              onClick={() => setWrapOverride(!wrapped)}
            >
              <WrapText size={15} />
            </button>
          )}
          <button className="code-copy" onClick={copy} aria-label={terminal ? copyLabels.commands : copyLabels.code}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? copyLabels.copied : terminal ? copyLabels.commands : copyLabels.copy}</span>
          </button>
        </div>
      </div>
      <pre ref={preRef} className={className} style={style} {...rest}>
        {fillCodeTree(children, labValues)}
      </pre>
    </div>
  );
}
