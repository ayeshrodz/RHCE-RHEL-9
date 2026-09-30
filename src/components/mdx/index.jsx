// Everything MDX pages can use without importing it.
import { useNavigate } from 'react-router-dom';
import CodeBlock from './CodeBlock';
import { fillInline, usePlaceholderValues } from '@/lib/placeholders';
import Callout from './Callout';
import { Card, Cards, Column, Columns, Glossary, Lead, Objectives, Reveal, Step, Steps, Tab, Tabs, Term } from './Layout';
import Quiz from '@/components/interactive/Quiz';
import Flashcards from '@/components/interactive/Flashcards';
import { Lab, Task } from '@/components/interactive/Lab';
import { Classroom, Env, EnvSwitch, Finish, HomeLab, HomeSetup, StarterFiles } from '@/components/interactive/Env';

// Every chapter's diagram/widget exports (src/diagrams/chNN/index.js) are
// registered automatically, so a new chapter needs no change here.
const chapterDiagrams = Object.assign({}, ...Object.values(import.meta.glob('/src/diagrams/ch*/index.js', { eager: true })));

// Inline code (and the <code> inside highlighted blocks, which CodeBlock handles).
function Code({ children, ...props }) {
  const [labValues] = usePlaceholderValues();
  return <code {...props}>{fillInline(children, labValues)}</code>;
}

// The router owns the URL hash, so heading links can't be plain #anchors:
// "#/ch00/page#heading" opens a page at a heading, "#heading" scrolls this one.
function Anchor({ href = '', onClick, ...props }) {
  const navigate = useNavigate();
  if (href.startsWith('#/') && href.indexOf('#', 1) > 0) {
    const [path, id] = href.slice(1).split('#');
    const go = (e) => {
      e.preventDefault();
      navigate(path, { state: { scrollTo: id } });
    };
    return <a href={`#${path}`} onClick={go} {...props} />;
  }
  if (href.startsWith('#') && !href.startsWith('#/')) {
    const go = (e) => {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    };
    return <a href={href} onClick={go} {...props} />;
  }
  return <a href={href} onClick={onClick} {...props} />;
}

function Table(props) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  );
}

export const mdxComponents = {
  a: Anchor,
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
