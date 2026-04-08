/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFFBF7',
        warm: '#FFF8F3',
        coral: '#E85D40',
      }
    },
  },
  plugins: [],
}
