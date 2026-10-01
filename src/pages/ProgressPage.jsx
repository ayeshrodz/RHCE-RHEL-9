import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { chapters, objectives, pages } from '@/lib/course';
import { useProgressData, useStored } from '@/lib/storage';
import { challenges } from '@/data/challenges';
import { validateLabReport } from '@/lib/labReports';
import { loadLabCatalog } from '@/components/interactive/LabBrief';

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
      const report = validateLabReport(JSON.parse(await file.text()), await loadLabCatalog());
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
    <article className="learning-dashboard prose">
      <p className="page-eyebrow">Saved in this browser</p>
      <h1>Your learning</h1>
      <p>
        Use your attempts and host checks to choose what to practise next. Export a backup from the header progress menu to move browsers or
        keep a copy.
      </p>
      {!storageAvailable && (
        <p role="status" className="callout">
          Browser storage is unavailable. Changes last only for this session; export your progress before closing it.
        </p>
      )}
      <section className="dashboard-next">
        <h2>Next lesson</h2>
        {next ? (
          <Link className="btn btn-primary" to={next.path}>
            {next.number} {next.section.title}
          </Link>
        ) : (
          <p>Reading complete. Try an integrated assessment or revisit a skill below.</p>
        )}
        <p>
          {done.length} sections marked read · {challenges.length - unfinished.length}/{challenges.length} browser activities with a
          successful latest attempt · {reports.length} imported lab reports.
        </p>
      </section>
      <h2>Review queue</h2>
      {missed.length + retry.length + weak.length === 0 ? (
        <p>No missed attempts or low confidence ratings yet. Try a knowledge check and rate your confidence to build your review queue.</p>
      ) : (
        <ul>
          {missed.map((q) => (
            <li key={q.id}>
              <Link to={q.path}>{q.prompt}</Link>
              <small> — {q.reason}</small>
            </li>
          ))}
          {retry.map((c) => (
            <li key={c.id}>
              <Link to={`/${c.chapter}/quiz#challenge-${c.id}`}>{c.title}</Link> — browser activity to retry
            </li>
          ))}
          {weak.map((o) => (
            <li key={o.id}>
              <Link to={`/${o.lessons[0]}`}>{label(o)}</Link> — confidence to revisit
            </li>
          ))}
        </ul>
      )}
      <details>
        <summary>Unfinished browser practice ({unfinished.length})</summary>
        <ul>
          {unfinished.map((c) => (
            <li key={c.id}>
              <Link to={`/${c.chapter}/quiz#challenge-${c.id}`}>
                {c.chapter.toUpperCase()}: {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>
      <h2>Lab evidence</h2>
      <p>
        On workstation, run <code>lab grade NAME --json &gt; result.json</code>, then import the report. Reports record the checks you ran;
        they do not predict an exam score.
      </p>
      <button className="btn" onClick={() => input.current?.click()}>
        Import lab report
      </button>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={upload} />
      <p role="status">{message}</p>
      {reports.length > 0 && (
        <ul>
          {reports
            .slice()
            .reverse()
            .map((r, i) => (
              <li key={`${r.exerciseId}:${r.checkpointId}:${r.checkedAt}:${i}`}>
                <Link to={r.checks[0].lesson.slice(1)}>
                  {r.exerciseId} / {r.checkpointId}
                </Link>
                : {r.checks.filter((c) => c.status === 'pass').length}/{r.checks.length} checks passed ·{' '}
                {new Date(r.checkedAt).toLocaleDateString()}
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
      <h2>Integrated practice</h2>
      <p>
        <Link to="/ch10/assessment-release">Release a web service</Link> ·{' '}
        <Link to="/ch10/assessment-operations">Prepare an operations host</Link>. Each has requirements, optional timing, hints, and local
        verification.
      </p>
      <h2>Skills and confidence</h2>
      <p>
        Reading, quiz answers, browser activities, lab reports, and confidence are separate evidence.{' '}
        <Link to="/ch10/how-to-review#where-do-you-stand">Rate your confidence</Link> after trying a task independently.
      </p>
      <details>
        <summary>Explore the skill map ({objectives.length} objectives)</summary>
        <ul>
          {objectives.map((o) => (
            <li key={o.id}>
              <strong>{label(o)}</strong>
              <br />
              {o.lessons.map((path, i) => (
                <span key={path}>
                  <Link to={`/${path}`}>Lesson {i + 1}</Link> ·{' '}
                </span>
              ))}
              {o.labs.map((path, i) => (
                <span key={path}>
                  <Link to={`/${path}`}>Lab {i + 1}</Link> ·{' '}
                </span>
              ))}
              {o.challenges.map((id) => (
                <span key={id}>
                  <Link to={`/${o.chapter}/quiz#challenge-${id}`}>Practice: {challenges.find((c) => c.id === id)?.title}</Link> ·{' '}
                </span>
              ))}
              <span>Confidence: {['not yet', 'shaky', 'confident'][data.readiness?.[o.id]] ?? 'unrated'}</span>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
