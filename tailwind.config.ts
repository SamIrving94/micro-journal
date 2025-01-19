import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          600: 'var(--orange-600)',
          700: 'var(--orange-700)',
        },
        clay: {
          50: '#faf7f5',
          100: '#f5efe9',
          200: '#ebe0d5',
          300: '#dbc7b6',
          400: '#c4a894',
          500: '#b08c74',
        },
      },
    },
  },
  plugins: [],
}

export default config