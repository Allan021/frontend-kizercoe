/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: 'var(--color-bg)', 2: 'var(--color-bg-2)', 3: 'var(--color-bg-3)' },
        card: { DEFAULT: 'var(--color-card)', 2: 'var(--color-card-2)' },
        brand: {
          cyan: '#00c8ff',
          cyan2: '#00e5ff',
          electric: '#00ff9d',
          orange: '#ff6b35',
        },
        muted: { DEFAULT: 'var(--color-muted)', 2: 'var(--color-muted-2)' },
        border: { DEFAULT: 'var(--color-border)', soft: 'var(--color-border-soft)' },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 40px rgba(0,200,255,0.25)',
        'glow-green': '0 0 40px rgba(0,255,157,0.2)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(0,200,255,0.08)',
        'btn': '0 4px 24px rgba(0,200,255,0.3)',
        'btn-hover': '0 8px 32px rgba(0,200,255,0.4)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'grid-move': 'gridMove 20s linear infinite',
        'scroll-left': 'scrollLeft 25s linear infinite',
        'scroll-left-slow': 'scrollLeft 30s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gridMove: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(60px)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
