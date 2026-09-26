// tailwind.config.ts


import type { Config } from 'tailwindcss';

const config: Config = {

  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // <--- THIS LINE IS CRITICAL
  ],
  theme: {
    extend: {
      colors: {
        orvix: {
          black: '#000000',
          dark: '#111111',
          surface: '#161616',
          panel: '#1A1A1A',
          border: '#262626',
          'border-crimson': '#420B0B',
          crimson: '#830000',
          'crimson-bright': '#BC0202',
          muted: '#808080',
          light: '#F4F4F5',
        },
      },
      fontFamily: {
        serif: ['var(--font-pt-serif)', 'serif'],
        mono: ['var(--font-libertinus-mono)', 'monospace'],
      },
      boxShadow: {
        'crimson-glow': '0 0 25px -5px rgba(188, 2, 2, 0.4)',
        'crimson-subtle': '0 0 15px -3px rgba(131, 0, 0, 0.25)',
      },
      backgroundImage: {
        'radial-gradient-dark': 'radial-gradient(circle at 50% 0%, #2A0505 0%, #000000 70%)',
        'grid-pattern': 'linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
