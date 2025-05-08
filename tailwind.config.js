/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          DEFAULT: '#634141',
          hover: '#4a3030',
          'dark-blue': '#0a192f',
        },
      },
    },
  },
  plugins: [],
}
