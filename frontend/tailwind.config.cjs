/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '.light-theme'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg-primary': 'var(--bg-primary)',
        'theme-bg-secondary': 'var(--bg-secondary)',
        'theme-bg-tertiary': 'var(--bg-tertiary)',
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-tertiary': 'var(--text-tertiary)',
        'theme-border': 'var(--border-color)',
      },
    },
  },
  plugins: [],
};

