import { useMediaQuery } from '@/hooks/useMediaQuery';
import TableOfContents from './TableOfContents';

/** Lessons and reference pages share their reading layout and responsive outline. */
export default function LearningPageLayout({ articleRef, contentKey, header, children, footer, className = '' }) {
  const compact = useMediaQuery('(max-width: 1280px)');
  const outline = <TableOfContents articleRef={articleRef} contentKey={contentKey} compact={compact} />;
  return (
    <div className={`page-grid ${className}`}>
      <article className="page-article" ref={articleRef}>
        {header}
        {compact && outline}
        {children}
        {footer}
      </article>
      {!compact && <aside className="page-aside">{outline}</aside>}
    </div>
  );
}
