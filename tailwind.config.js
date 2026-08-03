/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cofina: {
          red: '#D3122A',
          dark: '#1E293B',
          gray: '#F8FAFC',
          border: '#E2E8F0',
          accent: '#2563EB',
          gold: '#D97706',
          green: '#059669',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      }
    },
  },
  plugins: [],
}
