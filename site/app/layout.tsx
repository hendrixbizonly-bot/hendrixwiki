import type { Metadata } from 'next';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { getManifest } from '@/lib/articles';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hendrixpedia — The Personal Encyclopedia',
  description: 'Personal Wikipedia-style knowledge base for Hendrix Huynh. Compiled from a single raw context file.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { articles } = getManifest();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Linden+Hill&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TopBar articles={articles} />
        <main className="layout">
          <Sidebar />
          <section className="content">{children}</section>
        </main>
        <footer className="footer">
          <div>
            Hendrixpedia · rendered from <code>/wiki/articles</code> ·{' '}
            <a href="/raw">Raw</a> · <a href="/schema">Schema</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
