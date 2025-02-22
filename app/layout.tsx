import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TEDx Event Reveal',
  description: 'Join us for an exciting TEDx event reveal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}