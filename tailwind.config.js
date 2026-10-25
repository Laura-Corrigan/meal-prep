/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFFFF', // page background
        paper: '#FFFFFF', // surfaces
        mist: '#F4F4F4',  // chips, fields, placeholders
        ink: { DEFAULT: '#111111', soft: '#555555', faint: '#8E8E8E' },
        line: '#ECECEC',
        tomato: { DEFAULT: '#F2542D', dark: '#D4421C', soft: '#FEEDE8' },
        sage: { DEFAULT: '#2F8F5B', soft: '#E9F5EE' },
        butter: '#F4F4F4',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px #ECECEC',
        lift: '0 8px 28px rgba(0,0,0,.12)',
      },
    },
  },
  plugins: [],
}
