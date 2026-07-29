/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f9efd9',
          200: '#f2dcb0',
          300: '#e8c47d',
          400: '#dca54a',
          500: '#d18b2e',
          600: '#b36d24',
          700: '#915220',
          800: '#774320',
          900: '#64381e',
        },
        ink: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
        crimson: {
          500: '#b91c1c',
          600: '#991b1b',
          700: '#7f1d1d',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['Palatino Linotype', 'Palatino', 'serif'],
      }
    },
  },
  plugins: [],
}
