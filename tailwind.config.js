/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f5f6fa',
          100: '#e9eaf3',
          200: '#c9cce0',
          300: '#9fa3c6',
          400: '#6c70a1',
          500: '#4b4f82',
          600: '#363a6b',
          700: '#282b54',
          800: '#1b1e3f',
          900: '#111327',
        },
        accent: {
          50: '#f3fbf7',
          100: '#def6eb',
          200: '#b8ebd5',
          300: '#86dcb9',
          400: '#55c69a',
          500: '#36b082',
          600: '#298d68',
          700: '#226f54',
          800: '#1d5844',
          900: '#174939',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
