/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F1',
        paper: '#FFFFFF',
        ink: { DEFAULT: '#2A211C', soft: '#5C5049', faint: '#8F837A' },
        line: '#ECE3D8',
        tomato: { DEFAULT: '#D4572A', dark: '#B4441C', soft: '#FBE9E1' },
        sage: { DEFAULT: '#4D7A57', soft: '#E7F0E6' },
        butter: '#FFF3D9',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(42,33,28,.04), 0 4px 16px rgba(42,33,28,.06)',
        lift: '0 8px 30px rgba(42,33,28,.12)',
      },
    },
  },
  plugins: [],
}
