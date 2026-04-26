import type { Metadata } from 'next';
import { PageTabs } from '@/components/PageTabs';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hendrixpedia | A Living Personal Archive',
  description: 'A personal archive about Hendrix Huynh, organized like a nonfiction book across identity, work, ideas, media, life, and curiosity.',
  icons: {
    icon: '/original_1eb8cd13c228d5880cf19857ed06cb85.jpg',
    shortcut: '/original_1eb8cd13c228d5880cf19857ed06cb85.jpg',
    apple: '/original_1eb8cd13c228d5880cf19857ed06cb85.jpg',
  },
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
