import type { Metadata } from 'next';
import { PageTabs } from '@/components/PageTabs';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hendrix Wiki - The Personal Encyclopedia',
  description: 'Personal knowledge base for Hendrix Huynh, rendered in a wiki-style interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        <main className="layout">
          <Sidebar />
          <section className="page-frame">
            <PageTabs />
            <section className="content">{children}</section>
          </section>
        </main>
      </body>
    </html>
  );
}
