import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1A1A2E',
        card: '#242444',
        accent: '#003087',
        'accent-hover': '#0070D1',
        'discount-green': '#00C853',
        'discount-red': '#FF1744',
        'ps-gold': '#FFD700',
        muted: '#B0B0B0',
        border: '#3A3A5C',
        input: '#2E2E50',
        foreground: '#FFFFFF',
        'muted-foreground': '#B0B0B0',
        primary: {
          DEFAULT: '#003087',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#242444',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#FF1744',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#242444',
          foreground: '#FFFFFF',
        },
        ring: '#003087',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-once': 'bounce 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
