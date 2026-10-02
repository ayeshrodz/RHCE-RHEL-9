import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, CircleHelp, FlaskConical, ListChecks } from 'lucide-react';
import { chapters, course, track, pages } from '@/lib/course';
import { chapterProgress, useProgress } from '@/hooks/useProgress';
import { useStored } from '@/lib/storage';
import { Arrow, Diagram, Group, Node } from '@/diagrams/kit';

const features = [
  {
    icon: BookOpen,
    title: 'Lessons you can see',
    text: 'Every idea gets a clean diagram. Many are clickable or step through one stage at a time.',
    tone: 'purple',
  },
  {
    icon: FlaskConical,
    title: 'Hands-on exercises',
    text: 'Hands-on exercises as checklists that remember where you stopped.',
    tone: 'teal',
  },
  {
    icon: CircleHelp,
    title: 'Knowledge checks',
    text: 'Quick questions inside lessons and a full quiz at the end of each chapter.',
    tone: 'coral',
  },
  {
    icon: ListChecks,
    title: 'Cheat sheets',
    text: 'Each chapter ends with the commands, files and flashcards worth memorising.',
    tone: 'amber',
  },
];

// The course in stages; each links to its first chapter.
const stages = [
  { title: 'Foundations', chapters: [1, 2], text: 'What Ansible is, inventories, configuration, and your first playbooks.' },
  { title: 'Data and control', chapters: [3, 4], text: 'Variables, facts and secrets; loops, conditions, handlers and errors.' },
  { title: 'Files and structure', chapters: [5, 6], text: 'Templates and file modules; host patterns, imports and includes.' },
  { title: 'Reuse', chapters: [7], text: 'Roles, collections and the system roles.' },
  { title: 'Real work', chapters: [8, 9], text: 'Troubleshooting, then software, users, storage and networking.' },
  { title: 'Prove it', chapters: [10], text: 'Four review exercises and two integrated assessments.' },
  { title: 'Project workflow', chapters: [11], text: 'Git, editor containers, explicit runtimes, recovery and validated access.' },
];

const labHosts = [
  ['workstation · 172.25.250.9', 'Control node. You write and run playbooks here.'],
  ['servera … serverd · .10–.13', 'Managed hosts that your playbooks configure, each with a spare disk.'],
  ['utility · .8', 'Optional web server for practice files.'],
];

export default function HomePage() {
  const { done, percent } = useProgress();

  useEffect(() => {
    document.title = `${course.title} · ${course.tagline}`;
  }, []);

  const [lastVisited] = useStored('lastVisited', null);
  // Resume where the reader last was; otherwise the first unfinished section.
  const firstLesson = pages.find((p) => p.chapter.number >= 1) ?? pages[0];
  const resume = pages.find((p) => p.key === lastVisited) ?? pages.find((p) => !done.includes(p.key)) ?? firstLesson;
  const started = done.length > 0 || !!lastVisited;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="page-eyebrow">
            Free and open source · Ansible on RHEL {track.rhel} · {track.exam}-focused
          </p>
          <h1>{course.tagline}.</h1>
          <p className="hero-sub">
            A hands-on path from your first playbook to automating real Linux administration. Every idea is drawn as a diagram, every
            exercise runs on a practice lab you build yourself, and every chapter ends with a quiz and a cheat sheet.
          </p>
          <p className="hero-focus">
            The path follows the objectives of the Red Hat Certified Engineer ({track.exam}) exam, so it doubles as exam preparation.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-lg" to="/progress">
              Your learning
            </Link>
            <Link className="btn btn-primary btn-lg" to={started ? resume.path : firstLesson.path}>
              {started ? `Continue with ${resume.number}` : 'Start with chapter 1'} <ArrowRight size={16} />
            </Link>
            {!started && (
              <Link className="btn btn-lg" to="/ch00">
                <FlaskConical size={16} /> Build the practice lab
              </Link>
            )}
            {started && <span className="hero-progress">{percent}% complete</span>}
          </div>
        </div>
        <div className="hero-art">
          <HeroDiagram />
        </div>
      </section>

      <section className="features">
        {features.map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className={`feature t-${tone}`}>
            <span className="feature-icon">
              <Icon size={17} />
            </span>
            <p className="feature-title">{title}</p>
            <p className="feature-text">{text}</p>
          </div>
        ))}
      </section>

      <section className="home-section">
        <h2>The path</h2>
        <p className="home-section-sub">Each stage builds on the last. Your progress is saved in this browser.</p>
        <ol className="path" style={{ '--path-stages': stages.length }}>
          {stages.map((stage, i) => {
            const inStage = chapters.filter((c) => stage.chapters.includes(c.number));
            const total = inStage.reduce((n, c) => n + chapterProgress(c, done).total, 0);
            const count = inStage.reduce((n, c) => n + chapterProgress(c, done).count, 0);
            const state = total && count === total ? 'is-done' : count > 0 ? 'is-started' : '';
            return (
              <li key={stage.title} className={`path-stage ${state}`}>
                <Link to={`/ch${String(stage.chapters[0]).padStart(2, '0')}`} className="path-link">
                  <span className="path-dot">{state === 'is-done' ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                  <span className="path-body">
                    <span className="path-title">{stage.title}</span>
                    <span className="path-chapters">
                      Chapter{stage.chapters.length > 1 ? 's' : ''} {stage.chapters.join('–')}
                    </span>
                    <span className="path-text">{stage.text}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-section">
        <h2>Chapters</h2>
        <ol className="chapter-grid">
          {chapters.map((ch) => {
            const { count, total } = chapterProgress(ch, done);
            return (
              <li key={ch.id}>
                <Link to={`/${ch.id}`} className={`chapter-card ${ch.comingSoon ? 'is-soon' : ''}`}>
                  <span className="chapter-card-top">
                    <span className="chapter-card-num">{String(ch.number).padStart(2, '0')}</span>
                    {ch.comingSoon ? <span className="pill">Coming soon</span> : <span className="pill pill-accent">{total} sections</span>}
                  </span>
                  <span className="chapter-card-title">{ch.title}</span>
                  <span className="chapter-card-goal">{ch.goal}</span>
                  {!ch.comingSoon && (
                    <span className="chapter-card-bar" aria-label={`${count} of ${total} complete`}>
                      <span style={{ width: `${(count / total) * 100}%` }} />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="home-section home-lab">
        <div>
          <h2>Build the practice lab</h2>
          <p>
            The exercises use the machines from the official classroom. Chapter 0 builds a faithful copy on one Ubuntu machine: Rocky Linux
            9 VMs on LXD, with the usual classroom names, addresses and users, sealed off from your home network, plus a classroom-style{' '}
            <code>rht-vmctl</code> to reset machines between exercises.
          </p>
          <Link className="btn home-lab-cta" to="/ch00">
            <FlaskConical size={15} /> Open the lab guide <ArrowRight size={15} />
          </Link>
        </div>
        <dl className="host-list">
          {labHosts.map(([h, d]) => (
            <div key={h}>
              <dt>
                <code>{h}</code>
              </dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function HeroDiagram() {
  const hosts = [
    { x: 22, title: 'servera', sub: 'ok' },
    { x: 132, title: 'serverb', sub: 'changed' },
    { x: 242, title: 'serverc', sub: 'ok' },
  ];
  return (
    <Diagram width={360} height={300} title="A control node applying a playbook to three hosts over SSH" expandable={false}>
      <Group x={6} y={6} w={348} h={288} tone="gray" label="Your automation" />
      <Node x={22} y={42} w={150} h={56} tone="purple" title="site.yml" sub="desired state" />
      <Node x={188} y={42} w={150} h={56} tone="amber" title="inventory" sub="which hosts" />
      <Arrow
        points={[
          [97, 98],
          [97, 126],
        ]}
      />
      <Arrow
        points={[
          [263, 98],
          [263, 126],
        ]}
      />
      <Node x={22} y={128} w={316} h={56} tone="teal" title="ansible-navigator" sub="control node, no agents needed" />
      {hosts.map((h) => (
        <g key={h.title}>
          <Arrow
            points={[
              [180, 184],
              [180, 202],
              [h.x + 48, 202],
              [h.x + 48, 224],
            ]}
            label={h.x === 22 ? 'SSH' : undefined}
            labelAt={0.2}
            labelDx={-14}
          />
          <Node x={h.x} y={226} w={96} h={54} tone="green" title={h.title} sub={h.sub} />
        </g>
      ))}
    </Diagram>
  );
}
