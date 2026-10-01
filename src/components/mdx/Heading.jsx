import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Link as LinkIcon } from 'lucide-react';

// The router owns the URL hash ("#/ch07/collections"), so a section's address
// adds the heading id after a second "#": "#/ch07/collections#the-role-layout".
// React Router reads that second part as location.hash, and SectionPage
// scrolls to it once the page has loaded.
export function sectionUrl(pathname, id) {
  const { origin, pathname: base } = window.location;
  return `${origin}${base}#${pathname}#${id}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or a page not served over HTTPS: fall back to a hidden field.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    field.remove();
    return ok;
  }
}

/** h2 and h3 in MDX pages: the heading, plus a button that copies a link to it. */
function makeHeading(Tag) {
  return function Heading({ id, children, ...props }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
      if (!copied) return;
      const t = setTimeout(() => setCopied(false), 1600);
      return () => clearTimeout(t);
    }, [copied]);

    if (!id) return <Tag {...props}>{children}</Tag>;

    const copy = async () => {
      // Put the section in the address bar too, so the URL can be copied from there.
      navigate({ hash: `#${id}` }, { replace: true, state: { scrollSmooth: true } });
      setCopied(await copyText(sectionUrl(pathname, id)));
    };

    return (
      <Tag id={id} {...props}>
        {children}
        <button
          type="button"
          className="heading-link"
          onClick={copy}
          aria-label={copied ? 'Link copied' : 'Copy link to this section'}
          title={copied ? 'Link copied' : 'Copy link to this section'}
          data-copied={copied || undefined}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <LinkIcon size={16} aria-hidden="true" />}
        </button>
      </Tag>
    );
  };
}

export const H2 = makeHeading('h2');
export const H3 = makeHeading('h3');
