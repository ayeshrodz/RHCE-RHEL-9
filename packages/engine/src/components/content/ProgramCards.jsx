import { RootLink } from '@/lib/router';
import { programPercent, site } from '@/lib/course';

/** A card for each program on the site: its platform, whether it is open yet, and the reader's progress. */
export default function ProgramCards() {
  return (
    <ol className="chapter-grid program-cards">
      {site.programs.map((entry) => {
        const planned = entry.status === 'planned';
        const percent = programPercent(entry);
        return (
          <li key={entry.id}>
            <RootLink to={`/${entry.id}`} className={`chapter-card ${planned ? 'is-soon' : ''}`}>
              <span className="chapter-card-top">
                <span className="chapter-card-num">{entry.platform.label}</span>
                {planned ? <span className="pill">Planned</span> : <span className="pill pill-accent">{entry.sections} sections</span>}
              </span>
              <span className="chapter-card-title">{entry.title}</span>
              <span className="chapter-card-goal">{entry.summary}</span>
              {!planned && (
                <span className="chapter-card-bar" aria-label={`${percent}% complete`}>
                  <span style={{ width: `${percent}%` }} />
                </span>
              )}
            </RootLink>
          </li>
        );
      })}
    </ol>
  );
}
