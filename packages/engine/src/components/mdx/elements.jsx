// Element overrides used when rendering compiled pages: inline code (fills the reader's
// lab values) and links (router-aware, including links to a heading on another page).
import { useNavigate } from 'react-router-dom';
import { fillInline, usePlaceholderValues } from '@/lib/placeholders';

// Inline code (and the <code> inside highlighted blocks, which CodeBlock handles).
export function Code({ children, ...props }) {
  const [labValues] = usePlaceholderValues();
  return <code {...props}>{fillInline(children, labValues)}</code>;
}

// The router owns the URL hash, so heading links carry the heading after a
// second "#": "#/ch01/page#heading" opens a page at a heading, "#heading"
// scrolls this one. Page renderers share heading navigation.
export function Anchor({ href = '', onClick, ...props }) {
  const navigate = useNavigate();
  if (href.startsWith('#/') && href.indexOf('#', 1) > 0) {
    const go = (e) => {
      e.preventDefault();
      navigate(href.slice(1));
    };
    return <a href={href} onClick={go} {...props} />;
  }
  if (href.startsWith('#') && !href.startsWith('#/')) {
    const go = (e) => {
      e.preventDefault();
      navigate({ hash: href }, { replace: true, state: { scrollSmooth: true } });
    };
    return <a href={href} onClick={go} {...props} />;
  }
  return <a href={href} onClick={onClick} {...props} />;
}
