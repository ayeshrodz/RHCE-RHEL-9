// Everything MDX pages can use without importing it.
import { useNavigate } from 'react-router-dom';
import CodeBlock from './CodeBlock';
import Table from './Table';
import { fillInline, usePlaceholderValues } from '@/lib/placeholders';
import Callout from './Callout';
import { H2, H3 } from './Heading';
import { Card, Cards, Column, Columns, Glossary, Lead, Objectives, Reveal, Step, Steps, Tab, Tabs, Term } from './Layout';
import Quiz from '@/components/interactive/Quiz';
import AssessmentTimer from '@/components/interactive/AssessmentTimer';
import { lazyWidget } from '@/components/interactive/LazyWidget';
import chapterDiagrams from 'virtual:chapter-widgets';
const FlowMap = lazyWidget(() => import('@/components/interactive/FlowMap'));
const ChapterPractice = lazyWidget(() => import('@/components/interactive/ChapterPractice'));
import Flashcards from '@/components/interactive/Flashcards';
import { Lab, Task, LabChallenge, LabNotes } from '@/components/interactive/Lab';
import { Classroom, Env, EnvSwitch, Finish, HomeLab, HomeSetup, StarterFiles } from '@/components/interactive/Env';

// Inline code (and the <code> inside highlighted blocks, which CodeBlock handles).
function Code({ children, ...props }) {
  const [labValues] = usePlaceholderValues();
  return <code {...props}>{fillInline(children, labValues)}</code>;
}

// The router owns the URL hash, so heading links carry the heading after a
// second "#": "#/ch00/page#heading" opens a page at a heading, "#heading"
// scrolls this one. Page renderers share heading navigation.
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
  FlowMap,
  AssessmentTimer,
  Flashcards,
  Lab,
  LabChallenge,
  LabNotes,
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
