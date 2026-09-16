/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        onion: {
          50: '#fbf7ee',
          100: '#f5ecda',
          200: '#edd8b4',
          300: '#e1be87',
          400: '#d5a15b',
          500: '#c58437',
          600: '#aa682c',
          700: '#8b4f26',
          800: '#714024',
          900: '#5e3621',
          950: '#341b10',
        }
      }
    },
  },
  plugins: [],
}
