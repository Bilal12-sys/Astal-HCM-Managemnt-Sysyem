import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(null);

// This component saves the Daylight or Astral Night preference.
export function ThemeProvider({ children }) { const [theme, setTheme] = useState(localStorage.getItem('astral-theme') || 'daylight'); useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('astral-theme', theme); }, [theme]); return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>; }
// This hook reads and updates the active display theme.
export function useTheme() { return useContext(ThemeContext); }
