import Link from 'next/link';
import { articlesBySection, loadArticles, readMasterIndex, visibleArticles } from '@/lib/articles';
import { CLAUDE_SETUP_STEPS } from '@/lib/talk';

export function TalkPage() {
  const skill = readMasterIndex();
  const articles = visibleArticles(loadArticles());
  const sections = articlesBySection();

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Talk to AI Hendrix</h1>
        <p className="page-subtitle">
          Download the live archive as <code>index.md</code> or reuse that same archive as a
          Claude-ready <code>CLAUDE.md</code> file.
        </p>
        <p className="page-context">
          {articles.length} chapters across {sections.length} reader-facing sections -{' '}
          <a href="/index.md" download>
            download index.md
          </a>{' '}
          -{' '}
          <a href="/claude-skills.md" download>
            download claude skills
          </a>
        </p>
      </header>

      <div className="talk-page-grid">
        <div className="talk-page-main">
          <section className="info-box">
            <header className="info-box-head">Downloads</header>
            <div className="info-box-body">
              <div className="talk-actions">
                <a className="talk-button" href="/index.md" download>
                  Download index.md
                </a>
                <a className="talk-button secondary" href="/claude-skills.md" download>
                  Download Claude Skills
                </a>
              </div>
              <p className="talk-note">
                The Claude download uses the same live archive content as <code>index.md</code>. The
                only difference is that it downloads as <code>CLAUDE.md</code> so you can drop it
                straight into a Claude Code project root.
              </p>
            </div>
          </section>

          <section className="info-box">
            <details className="talk-dropdown" open={false}>
              <summary className="info-box-head talk-dropdown-toggle">Current context pack preview</summary>
              <div className="info-box-body">
                <p className="talk-note">
                  This is the live <code>index.md</code> export that powers both downloads above.
                </p>
                <pre className="raw talk-raw">{skill}</pre>
              </div>
            </details>
          </section>
        </div>

        <aside className="talk-page-side">
          <section className="info-box compact">
            <header className="info-box-head">Set up in Claude Code</header>
            <div className="info-box-body">
              <ol className="info-list">
                {CLAUDE_SETUP_STEPS.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </section>

          <section className="info-box compact">
            <header className="info-box-head">Useful links</header>
            <div className="info-box-body">
              <p className="browse-item">
                <Link href="/raw">Open raw notes</Link>
                <span> - inspect the source material behind the archive.</span>
              </p>
              <p className="browse-item">
                <Link href="/graph">Open the graph</Link>
                <span> - explore chapter relationships visually before importing.</span>
              </p>
              <p className="browse-item">
                <Link href="/a/meta/start-here">Read the wiki spine</Link>
                <span> - start from the main orientation chapter.</span>
              </p>
              <p className="browse-item">
                <a href="/claude-skills.md" download>
                  Download Claude Skills
                </a>
                <span> - get the live archive as a Claude-ready `CLAUDE.md` file.</span>
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
