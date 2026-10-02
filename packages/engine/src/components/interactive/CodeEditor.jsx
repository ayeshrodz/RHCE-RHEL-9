import { useRef, useState } from 'react';
import { IndentIncrease, IndentDecrease, WrapText } from 'lucide-react';
import { indentSelection } from '@/lib/editor';
import { defineWidget } from './TeachingContent';

/** A single editor for authored exercises: soft wrapping and explicit indentation. */
export default defineWidget('CodeEditor', (copy) => {
  function CodeEditor({ value, onChange, className = '', ...props }) {
    const ref = useRef(null);
    const [wrap, setWrap] = useState(true);
    const indent = (outdent) => {
      const element = ref.current;
      const result = indentSelection(value, element.selectionStart, element.selectionEnd, outdent);
      element.value = result.value;
      onChange?.({ target: element, currentTarget: element });
      requestAnimationFrame(() => {
        element.focus({ preventScroll: true });
        element.setSelectionRange(result.start, result.end);
      });
    };
    return (
      <div className="code-editor">
        <div className="editor-tools" role="group" aria-label={copy.text.tools}>
          <button
            type="button"
            className="btn btn-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => indent(false)}
            title={copy.text.indent}
          >
            <IndentIncrease size={15} /> {copy.text.indent}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => indent(true)}
            title={copy.text.outdent}
          >
            <IndentDecrease size={15} /> {copy.text.outdent}
          </button>
          <button type="button" className="btn btn-sm editor-wrap" aria-pressed={wrap} onClick={() => setWrap((v) => !v)}>
            <WrapText size={15} /> {copy.text.wrap}
          </button>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          wrap={wrap ? 'soft' : 'off'}
          className={className}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          {...props}
        />
      </div>
    );
  }
  return CodeEditor;
});
