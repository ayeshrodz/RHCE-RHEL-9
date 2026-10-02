import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { chapters, objectives, pages } from '@/lib/course';
import { useProgressData, useStored } from '@/lib/storage';
import { challenges } from 'virtual:challenges';
import { validateLabReport } from '@/lib/labReports';

const EMPTY = [];
export default function ProgressPage() {
  const { data, storageAvailable } = useProgressData();
  const [reports, setReports] = useStored('labReports', EMPTY);
  const [message, setMessage] = useState('');
  const input = useRef(null);
  const done = data.completed ?? [];
  const next = pages.find((p) => !done.includes(p.key) && p.chapter.number >= 1 && p.section.kind === 'lesson');
  const missed = pages.flatMap((p) =>
    (p.section.activities?.quizzes ?? []).flatMap((question) => {
      const item = data[`quiz:${p.key}:${question.quizId}`]?.items?.[question.id];
      const last = item?.attempts.at(-1);
      return last && (last.correct !== true || last.revision !== question.revision)
        ? [
            {
              ...question,
              path: `${p.path}#${question.id}`,
              reason: last.revision !== question.revision ? 'Fresh attempt needed' : 'Review the explanation and retry',
            },
          ]
        : [];
    }),
  );
  const unfinished = challenges.filter((c) => data[`challenge:${c.id}`]?.at(-1)?.passed !== true);
  const retry = unfinished.filter((c) => data[`challenge:${c.id}`]?.length);
  const weak = objectives.filter((o) => [0, 1].includes(data.readiness?.[o.id]));
  const label = (o) => {
    const chapter = chapters.find((c) => c.id === o.chapter);
    return chapter.objectives[chapter.objectiveIds.indexOf(o.id)] ?? o.id;
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 500_000) throw new Error('This report is too large.');
      const report = validateLabReport(JSON.parse(await file.text()));
      setReports((old) => [
        ...old
          .filter(
            (r) => !(r.exerciseId === report.exerciseId && r.checkpointId === report.checkpointId && r.checkedAt === report.checkedAt),
          )
          .slice(-99),
        report,
      ]);
      setMessage(`Saved ${report.exerciseId} / ${report.checkpointId}. Reading and checklist progress are unchanged.`);
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'That file is not valid JSON.' : error.message);
    }
  };
  useEffect(() => {
    document.title = 'Your learning · Playbook Path';
  }, []);
  return (
    <article className="learning-dashboard">
      <header className="page-header">
        <p className="page-eyebrow">Saved in this browser</p>
        <h1 className="page-title">Your learning</h1>
        <p className="dashboard-intro">
          Choose your next step from what you have read, tried, and verified. Export a backup from the header progress menu to keep a copy
          or move browsers.
        </p>
      </header>
      {!storageAvailable && (
        <p role="status" className="dashboard-warning">
          Browser storage is unavailable. Changes last only for this session; export your progress before closing it.
        </p>
      )}
      <dl className="dashboard-stats">
        <div>
          <dt>Reading</dt>
          <dd>
            {done.length}
            <small> / {pages.length} sections marked read</small>
          </dd>
        </div>
        <div>
          <dt>Browser practice</dt>
          <dd>
            {challenges.length - unfinished.length}
            <small> / {challenges.length} successful latest attempts</small>
          </dd>
        </div>
        <div>
          <dt>Lab evidence</dt>
          <dd>
            {reports.length}
            <small> imported reports</small>
          </dd>
        </div>
      </dl>
      <section className="dashboard-card dashboard-next" aria-labelledby="dashboard-next-title">
        <p className="page-eyebrow">Keep going</p>
        <h2 id="dashboard-next-title">{next ? next.section.title : 'Reading complete'}</h2>
        <p>
          {next
            ? `Next lesson · ${next.number} · about ${next.section.minutes} minutes`
            : 'Try an integrated assessment or revisit a skill below.'}
        </p>
        {next && (
          <Link className="btn" to={next.path}>
            Continue lesson
          </Link>
        )}
      </section>
      <div className="dashboard-grid">
        <section className="dashboard-card" aria-labelledby="dashboard-review-title">
          <h2 id="dashboard-review-title">Review queue</h2>
          {missed.length + retry.length + weak.length === 0 ? (
            <p>No reviews yet. Try a knowledge check and rate your confidence to find skills worth revisiting.</p>
          ) : (
            <ul className="dashboard-list">
              {missed.map((q) => (
                <li key={q.id}>
                  <Link to={q.path}>{q.prompt}</Link>
                  <small>{q.reason}</small>
                </li>
              ))}
              {retry.map((c) => (
                <li key={c.id}>
                  <Link to={`/${c.chapter}/quiz#challenge-${c.id}`}>{c.title}</Link>
                  <small>Browser activity to retry</small>
                </li>
              ))}
              {weak.map((o) => (
                <li key={o.id}>
                  <Link to={`/${o.lessons[0]}`}>{label(o)}</Link>
                  <small>Confidence to revisit</small>
                </li>
              ))}
            </ul>
          )}
          {unfinished.length > 0 && (
            <details>
              <summary>Unfinished browser practice ({unfinished.length})</summary>
              <ul className="dashboard-list">
                {unfinished.map((c) => (
                  <li key={c.id}>
                    <Link to={`/${c.chapter}/quiz#challenge-${c.id}`}>{c.title}</Link>
                    <small>Chapter {Number(c.chapter.slice(2))}</small>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
        <section className="dashboard-card" aria-labelledby="dashboard-assessment-title">
          <h2 id="dashboard-assessment-title">Integrated practice</h2>
          <p>
            Combine several skills on a real host. Each assessment offers requirements, an optional timer, help, and local verification.
          </p>
          <ul className="dashboard-list">
            <li>
              <Link to="/ch10/assessment-release">Release a web service</Link>
              <small>Roles, protected variables, HTTP and recovery · 90 min</small>
            </li>
            <li>
              <Link to="/ch10/assessment-operations">Prepare an operations host</Link>
              <small>Storage, access, scheduling and networking · 90 min</small>
            </li>
          </ul>
          <p className="dashboard-note">
            Use successful independent attempts as practice evidence. These activities do not predict an exam score.
          </p>
        </section>
      </div>
      <section className="dashboard-card" aria-labelledby="dashboard-evidence-title">
        <h2 id="dashboard-evidence-title">Lab evidence</h2>
        <p>
          On workstation, save a report with <code>lab grade NAME --json &gt; result.json</code>. Copy the file to this browser’s machine,
          then import it here.
        </p>
        <div className="dashboard-actions">
          <button className="btn" onClick={() => input.current?.click()}>
            Import lab report
          </button>
          <span>JSON reports from the home-lab grader</span>
        </div>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={upload} />
        <div role="status" className="dashboard-status">
          {message}
        </div>
        {reports.length === 0 ? (
          <p className="dashboard-note">
            No reports imported yet. Task checkboxes record your checklist; reports record observed project files and host state.
          </p>
        ) : (
          <ul className="dashboard-list">
            {reports
              .slice()
              .reverse()
              .map((r, i) => (
                <li key={`${r.exerciseId}:${r.checkpointId}:${r.checkedAt}:${i}`}>
                  <Link to={r.checks[0].lesson.slice(1)}>
                    {r.exerciseId} / {r.checkpointId}
                  </Link>
                  <small>
                    {r.checks.filter((c) => c.status === 'pass').length}/{r.checks.length} checks passed ·{' '}
                    {new Date(r.checkedAt).toLocaleDateString()}
                  </small>
                  <details>
                    <summary>Check results</summary>
                    <ul>
                      {r.checks.map((c) => (
                        <li key={c.id}>
                          {c.status.toUpperCase()}: {c.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
          </ul>
        )}
      </section>
      <section className="dashboard-card" aria-labelledby="dashboard-skills-title">
        <h2 id="dashboard-skills-title">Skills and confidence</h2>
        <p>
          Reading, questions, activities, lab reports, and confidence are recorded separately.{' '}
          <Link to="/ch10/how-to-review#where-do-you-stand">Rate your confidence</Link> after trying a task independently.
        </p>
        <details>
          <summary>Explore the skill map ({objectives.length} objectives)</summary>
          <ul className="dashboard-list">
            {objectives.map((o) => (
              <li key={o.id}>
                <strong>{label(o)}</strong>
                <div className="dashboard-skill-links">
                  {o.lessons.map((path, i) => (
                    <Link key={path} to={`/${path}`}>
                      Lesson {i + 1}
                    </Link>
                  ))}
                  {o.labs.map((path, i) => (
                    <Link key={path} to={`/${path}`}>
                      Lab {i + 1}
                    </Link>
                  ))}
                  {o.challenges.map((id) => (
                    <Link key={id} to={`/${o.chapter}/quiz#challenge-${id}`}>
                      Practice: {challenges.find((c) => c.id === id)?.title}
                    </Link>
                  ))}
                </div>
                <small>Confidence: {['not yet', 'shaky', 'confident'][data.readiness?.[o.id]] ?? 'unrated'}</small>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </article>
  );
}
