module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e2231a',
        secondary: {
          DEFAULT: '#000000',
          dark: '#1a1a1a',
        },
        accent: '#005ea5',
        'light-gray': '#f5f5f5',
        'border-gray': '#e0e0e0',
        success: '#1bb75e',
        error: '#cc0000',
        link: '#005ea5',
      },
      fontFamily: {
        sans: ['NAB Sans', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
