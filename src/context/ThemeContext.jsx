import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('codoai_theme') || 'dark';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } catch (err) {
      console.error('Failed to load theme:', err);
    }
    setIsLoaded(true);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('codoai_theme', newTheme);
      } catch (err) {
        console.error('Failed to save theme:', err);
      }
      applyTheme(newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
