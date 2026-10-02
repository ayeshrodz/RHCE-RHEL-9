// Maps catalog tags (the content contract) to engine components. Content refers to tags
// by name with typed attributes; how each tag renders is entirely the engine's choice, so
// components can be rewritten or upgraded without touching content.
import { lazy } from 'react';
import Callout from '@/components/mdx/Callout';
import { Card, Cards, Column, Columns, Glossary, Lead, Objectives, Reveal, Step, Steps, Tab, Tabs, Term } from '@/components/mdx/Layout';
import Quiz from '@/components/interactive/Quiz';
import Flashcards from '@/components/interactive/Flashcards';
import AssessmentTimer from '@/components/interactive/AssessmentTimer';
import { Lab, LabChallenge, LabNotes, Task } from '@/components/interactive/Lab';
import { Classroom, Env, EnvSwitch, Finish, HomeLab, HomeSetup, StarterFiles } from '@/components/interactive/Env';
import { lazyWidget } from '@/components/interactive/LazyWidget';
import chapterWidgets from 'virtual:chapter-widgets';

const FlowMap = lazyWidget(() => import('@/components/interactive/FlowMap'));
const ChapterPractice = lazyWidget(() => import('@/components/interactive/ChapterPractice'));

/**
 * Each entry turns a tag's attributes, its page data and the page context into a
 * component and props. Unknown tags have no entry and render nothing.
 */
export const tags = {
  lead: () => [Lead],
  objectives: () => [Objectives],
  callout: (a) => [Callout, { type: a.type, title: a.title }],
  cards: (a) => [Cards, { cols: a.cols }],
  card: (a) => [Card, { title: a.title, kicker: a.kicker, tone: a.tone }],
  columns: () => [Columns],
  column: (a) => [Column, { title: a.title, tone: a.tone }],
  tabs: () => [Tabs],
  tab: (a) => [Tab, { label: a.label }],
  reveal: (a) => [Reveal, { title: a.title }],
  steps: () => [Steps],
  step: (a) => [Step, { title: a.title }],
  glossary: () => [Glossary],
  term: (a) => [Term, { name: a.name }],
  kbd: () => ['kbd'],

  quiz: (a, data) => [Quiz, { id: a.id, title: a.title, questions: data.questions }],
  practice: (a, data, page) => [
    ChapterPractice,
    { chapter: page.chapterId, challenges: data.questions.map((q) => ({ ...q, chapter: page.chapterId })) },
  ],
  flashcards: (a, data) => [Flashcards, { title: a.title, cards: data.cards }],
  'assessment-timer': (a) => [AssessmentTimer, { id: a.id, minutes: a.minutes }],
  lab: (a) => [
    Lab,
    {
      id: a.id,
      title: a.title,
      outcomes: a.outcomes,
      hosts: a.hosts,
      starter: a.starter,
      own: a.ownExercise,
      classroom: a.exercise ? `lab start ${a.exercise}` : undefined,
    },
  ],
  task: (a) => [Task, { id: a.id, title: a.title }],
  'lab-notes': () => [LabNotes],
  'lab-challenge': () => [LabChallenge],
  'lab-setup': () => [HomeSetup],
  'lab-finish': (a) => [Finish, { name: a.exercise, grade: a.grade }],
  'starter-files': (a) => [StarterFiles, { name: a.exercise }],

  'variant-group': () => [Env],
  variant: (a) => (a.name === 'classroom' ? [Classroom] : [HomeLab, { title: a.title }]),
  'variant-switch': (a) => [EnvSwitch, { label: a.label }],
  'reader-variables': () => [chapterWidgets.LabValues],

  'flow-map': (a, data) => [FlowMap, { title: a.title, caption: a.caption, steps: data.steps, connections: data.connections }],
  'legacy-widget': (a, data) => [chapterWidgets[a.name], data.props ?? {}],
};

/** Strip undefined props so components keep their own defaults. */
export function cleanProps(props) {
  return props ? Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) : {};
}
