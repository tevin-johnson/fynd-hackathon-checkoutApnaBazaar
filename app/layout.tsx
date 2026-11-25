import type { Metadata, Viewport } from 'next';
import { Bagel_Fat_One, Fredoka, Gochi_Hand } from 'next/font/google';
import './globals.css';

// next/font downloads these at build time and serves them from our own origin,
// so there are no runtime requests to Google (keeps CSP default-src 'self').
// Display: Bagel Fat One (bubbly). Text: Fredoka (rounded). Accent: Gochi Hand (hand-drawn).
const display = Bagel_Fat_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bagel',
  display: 'swap',
});
const body = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});
const hand = Gochi_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-gochi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Apna Bazaar — Checkout',
  description: 'A tiny, very colourful checkout for a fictional neighbourhood store.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#ff2e88',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
