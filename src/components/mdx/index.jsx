// Everything MDX pages can use without importing it.
import { Children, cloneElement, isValidElement } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeBlock from './CodeBlock';
import { fillInline, usePlaceholderValues } from '@/lib/placeholders';
import Callout from './Callout';
import { H2, H3 } from './Heading';
import { Card, Cards, Column, Columns, Glossary, Lead, Objectives, Reveal, Step, Steps, Tab, Tabs, Term } from './Layout';
import Quiz from '@/components/interactive/Quiz';
import AssessmentTimer from '@/components/interactive/AssessmentTimer';
import { lazyWidget } from '@/components/interactive/LazyWidget';
import chapterDiagrams from 'virtual:chapter-widgets';
const ChapterPractice = lazyWidget(() => import('@/components/interactive/Challenge'));
import Flashcards from '@/components/interactive/Flashcards';
import { Lab, Task } from '@/components/interactive/Lab';
import { Classroom, Env, EnvSwitch, Finish, HomeLab, HomeSetup, StarterFiles } from '@/components/interactive/Env';

// Inline code (and the <code> inside highlighted blocks, which CodeBlock handles).
function Code({ children, ...props }) {
  const [labValues] = usePlaceholderValues();
  return <code {...props}>{fillInline(children, labValues)}</code>;
}

// The router owns the URL hash, so heading links carry the heading after a
// second "#": "#/ch00/page#heading" opens a page at a heading, "#heading"
// scrolls this one. SectionPage does the scrolling.
function Anchor({ href = '', onClick, ...props }) {
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

// Each body cell gets its column heading as data-label, so that on a phone the
// table can turn into a stack of labelled cards instead of a sideways scroll.
function Table({ children, ...props }) {
  const head = elements(children, 'thead')[0];
  const labels = head ? elements(elements(head.props.children)[0]?.props.children).map((th) => textOf(th.props.children).trim()) : [];
  const body = Children.map(children, (section) =>
    isValidElement(section) && section.type === 'tbody'
      ? cloneElement(
          section,
          {},
          Children.map(section.props.children, (row) =>
            isValidElement(row)
              ? cloneElement(
                  row,
                  {},
                  elements(row.props.children).map((cell, i) =>
                    cloneElement(cell, { 'data-label': labels[i] ?? '' }, <span className="td-val">{cell.props.children}</span>),
                  ),
                )
              : row,
          ),
        )
      : section,
  );
  return (
    <div className="table-wrap">
      <table {...props}>{body}</table>
    </div>
  );
}

export const mdxComponents = {
  a: Anchor,
  h2: H2,
  h3: H3,
  pre: CodeBlock,
  code: Code,
  table: Table,
  Callout,
  Lead,
  Objectives,
  Cards,
  Card,
  Columns,
  Column,
  Tabs,
  Tab,
  Reveal,
  Steps,
  Step,
  Glossary,
  Term,
  Quiz,
  ChapterPractice,
  AssessmentTimer,
  Flashcards,
  Lab,
  Task,
  Env,
  Classroom,
  HomeLab,
  HomeSetup,
  EnvSwitch,
  Finish,
  StarterFiles,
  ...chapterDiagrams,
};
