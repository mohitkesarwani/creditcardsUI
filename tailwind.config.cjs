module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#0066b3',
        navy: '#003e6b',
        'light-bg': '#f5f5f5',
        'body-text': '#000000',
        'primary-blue': '#1556f0',
        'soft-blue': '#e3efff',
        'text-dark': '#1c1e21',
        'gray-bg': '#f7f9fc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
