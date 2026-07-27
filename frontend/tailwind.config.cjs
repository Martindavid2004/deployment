const customGreen = {
  50: '#f4f8f0',
  100: '#e5eedd',
  200: '#cedfbd',
  300: '#b0cc96',
  400: '#8ebf5c',
  500: '#6a9641',
  600: '#588034',
  700: '#466629',
  800: '#364d1f',
  900: '#2a3c19',
  950: '#15200b',
};

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
        blue: customGreen,
        indigo: customGreen,
        sky: customGreen,
        cyan: customGreen,
        brand: customGreen,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

