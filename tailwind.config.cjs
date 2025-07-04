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
        primary: '#00813E',
        secondary: '#E00000',
        text: '#222222',
        background: '#F7F7F7',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
