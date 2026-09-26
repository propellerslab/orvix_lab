// lib/fonts.ts
import { PT_Serif } from 'next/font/google';
import localFont from 'next/font/local';

export const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
});

// Configure Libertinus Mono (or fallback to monospace stack if local file is pending)
export const libertinusMono = localFont({
  src: [
    {
      path: '../public/fonts/LibertinusMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-libertinus-mono',
  fallback: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
  display: 'swap',
});
