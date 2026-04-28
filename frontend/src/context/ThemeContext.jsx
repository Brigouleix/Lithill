import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { key: 'amber',  icon: '☀',  label: 'Ambre'  },
  { key: 'foret',  icon: '🌿', label: 'Foret'  },
  { key: 'lagoon', icon: '≋',  label: 'Lagon'  },
  { key: 'sombre', icon: '☾',  label: 'Sombre' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('lithill_theme') || 'amber'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lithill_theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((t) => {
      const idx = THEMES.findIndex((x) => x.key === t);
      return THEMES[(idx + 1) % THEMES.length].key;
    });
  };

  const current = THEMES.find((t) => t.key === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, current, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
