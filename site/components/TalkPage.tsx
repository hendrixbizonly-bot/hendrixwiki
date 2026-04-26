import Link from 'next/link';
import { articlesBySection, loadArticles, readMasterIndex, visibleArticles } from '@/lib/articles';

export function TalkPage() {
  const skill = readMasterIndex();
  const articles = visibleArticles(loadArticles());
  const sections = articlesBySection();

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Talk to AI Hendrix</h1>
        <p className="page-subtitle">
          This page exposes the live <code>/wiki/index.md</code> context pack so anyone can download it,
          import it into an LLM, and chat with AI Hendrix with the current archive already loaded.
        </p>
        <p className="page-context">
          {articles.length} chapters across {sections.length} reader-facing sections ·{' '}
          <a href="/index.md" download>
            download index.md
          </a>
        </p>
      </header>

      <div className="talk-page-grid">
        <div className="talk-page-main">
          <section className="info-box">
            <header className="info-box-head">Current context pack</header>
            <div className="info-box-body">
              <div className="talk-actions">
                <a className="talk-button" href="/index.md" download>
                  Download index.md
                </a>
                <a className="talk-button secondary" href="/index.md">
                  Open raw markdown
                </a>
              </div>
              <p className="talk-note">
                Drop this file into a custom GPT, Claude project, NotebookLM, or any other tool that
                accepts raw context and markdown knowledge.
              </p>
              <pre className="raw talk-raw">{skill}</pre>
            </div>
          </section>
        </div>

        <aside className="talk-page-side">
          <section className="info-box compact">
            <header className="info-box-head">How to use</header>
            <div className="info-box-body">
              <ol className="info-list">
                <li>Download the current <code>index.md</code> export.</li>
                <li>Upload or paste it into your preferred LLM workspace.</li>
                <li>Ask the model to answer in Hendrix&apos;s voice and use the archive as grounding context.</li>
              </ol>
            </div>
          </section>

          <section className="info-box compact">
            <header className="info-box-head">Useful links</header>
            <div className="info-box-body">
              <p className="browse-item">
                <Link href="/raw">Open raw notes</Link>
                <span> — inspect the source material behind the archive.</span>
              </p>
              <p className="browse-item">
                <Link href="/graph">Open the graph</Link>
                <span> — explore chapter relationships visually before importing.</span>
              </p>
              <p className="browse-item">
                <Link href="/a/meta/start-here">Read the wiki spine</Link>
                <span> — start from the main orientation chapter.</span>
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
