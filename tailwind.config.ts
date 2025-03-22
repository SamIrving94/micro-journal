import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',  // Scan all files in src
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        orange: {
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
        },
        // Clay colors
        clay: {
          50: 'var(--clay-50)',
          100: 'var(--clay-100)',
          200: 'var(--clay-200)',
          300: 'var(--clay-300)',
          400: 'var(--clay-400)',
          500: 'var(--clay-500)',
        },
        // UI colors
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
      backgroundColor: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
      },
      textColor: {
        primary: 'var(--primary)',
      },
      ringColor: {
        primary: 'var(--primary)',
      },
    },
  },
  plugins: [],
}

export default config