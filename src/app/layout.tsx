import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Video Editor',
  description: 'CapCut-like video editor built with Remotion',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
