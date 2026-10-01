import { Link } from 'react-router-dom';
import { course } from '@/lib/course';
import Logo from './Logo';

const year = new Date().getFullYear();

/** Site footer: what this project is, what it is not, and where to find the source. */
export default function Footer() {
  const repo = course.repo;
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-about">
          <p className="site-footer-brand">
            <Logo /> {course.title}
          </p>
          <p>
            {course.tagline}: a free, community-made course written by learners for learners, focused on the RHCE exam objectives. Free to
            read, free to reuse, open to contributions.
          </p>
        </div>

        <nav className="site-footer-links" aria-label="Project">
          <p className="site-footer-head">Project</p>
          <ul>
            <li>
              <Link to="/">Course overview</Link>
            </li>
            <li>
              <Link to="/ch00">Build the practice lab</Link>
            </li>
            {repo && (
              <>
                <li>
                  <a href={repo} target="_blank" rel="noopener noreferrer">
                    Source on GitHub
                  </a>
                </li>
                <li>
                  <a href={`${repo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">
                    Contribute
                  </a>
                </li>
                <li>
                  <a href={`${repo}/issues/new/choose`} target="_blank" rel="noopener noreferrer">
                    Report a mistake
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>

        <nav className="site-footer-links" aria-label="Official sources">
          <p className="site-footer-head">Official sources</p>
          <ul>
            <li>
              <a href="https://www.redhat.com/en/services/certification" target="_blank" rel="noopener noreferrer">
                Red Hat certification
              </a>
            </li>
            <li>
              <a href="https://docs.ansible.com/" target="_blank" rel="noopener noreferrer">
                Ansible documentation
              </a>
            </li>
            <li>
              <a href="https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9" target="_blank" rel="noopener noreferrer">
                RHEL 9 documentation
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="site-footer-legal">
        <p className="site-footer-disclaimer">
          <strong>An independent, community-made study companion. Not affiliated with, sponsored by, or endorsed by Red Hat, Inc.</strong>{' '}
          This is not official training material and is no substitute for Red Hat's courses, documentation or exam objectives, which remain
          the authoritative sources.
        </p>
        <p>
          Red Hat, Red Hat Enterprise Linux, RHCE and Ansible are trademarks or registered trademarks of Red Hat, Inc. or its subsidiaries
          in the United States and other countries. Linux is a registered trademark of Linus Torvalds. All other trademarks belong to their
          respective owners. These names are used only to describe what the guide is about.
        </p>
        <p>
          © {year} {course.title} contributors. Text and diagrams are licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          ; source code under the{' '}
          {repo ? (
            <a href={`${repo}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
              MIT licence
            </a>
          ) : (
            'MIT licence'
          )}
          . Provided as is, with no warranty: test everything on a lab before you rely on it.
        </p>
      </div>
    </footer>
  );
}
