/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8B1A1A',
        accent: '#BA7517',
        background: '#FAF7F2',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
