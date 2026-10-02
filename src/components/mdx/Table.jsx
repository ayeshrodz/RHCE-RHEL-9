import { Children, cloneElement, isValidElement } from 'react';
import { tableColumnWidths } from '@/lib/tableLayout';

const textOf = (node) =>
  node == null || typeof node === 'boolean'
    ? ''
    : typeof node === 'string' || typeof node === 'number'
      ? String(node)
      : Array.isArray(node)
        ? node.map(textOf).join('')
        : isValidElement(node)
          ? textOf(node.props.children)
          : '';
const elements = (node, type) => Children.toArray(node).filter((c) => isValidElement(c) && (!type || c.type === type));

/** Shared MDX tables: readable columns on desktop, labelled row cards in narrow spaces. */
export default function Table({ children, className = '', ...props }) {
  const sections = elements(children);
  const head = sections.find((section) => section.type === 'thead');
  const labels = head ? elements(elements(head.props.children)[0]?.props.children).map((cell) => textOf(cell.props.children).trim()) : [];
  const rows = sections.filter((section) => section.type === 'tbody').flatMap((section) => elements(section.props.children));
  const widths = tableColumnWidths(
    labels,
    rows.map((row) => elements(row.props.children).map((cell) => textOf(cell.props.children))),
  );
  const body = Children.map(children, (section) => {
    if (!isValidElement(section) || !['thead', 'tbody', 'tfoot'].includes(section.type)) return section;
    const heading = section.type === 'thead';
    return cloneElement(
      section,
      { role: 'rowgroup' },
      Children.map(section.props.children, (row) => {
        if (!isValidElement(row)) return row;
        return cloneElement(
          row,
          { role: 'row' },
          elements(row.props.children).map((cell, i) =>
            cloneElement(
              cell,
              heading
                ? { scope: 'col', role: 'columnheader' }
                : { 'data-label': labels[i] ?? '', role: cell.type === 'th' ? 'rowheader' : 'cell' },
              heading ? cell.props.children : <span className="td-val">{cell.props.children}</span>,
            ),
          ),
        );
      }),
    );
  });
  return (
    <div className="table-wrap">
      <div className="table-frame">
        <table className={`content-table ${className}`} role="table" {...props}>
          {widths.length > 0 && (
            <colgroup>
              {widths.map((width, i) => (
                <col key={i} style={{ width: `${width}%` }} />
              ))}
            </colgroup>
          )}
          {body}
        </table>
      </div>
    </div>
  );
}
