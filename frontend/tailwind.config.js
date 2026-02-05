/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d2',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        gradient: {
          start: '#6366f1', // indigo
          end: '#8b5cf6',   // violet
          bluePurple: 'linear-gradient(to right, #6366f1, #8b5cf6)',
          purplePink: 'linear-gradient(to right, #8b5cf6, #ec4899)',
        }
      },
      backgroundImage: {
        'blue-purple-gradient': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'purple-pink-gradient': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      }
    },
  },
  plugins: [],
};