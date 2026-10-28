import { createContext, useContext, useEffect, useState } from 'react';
const MotionContext = createContext(null);

// This component stores the Lite mode preference.
export function MotionProvider({ children }) { const [liteMode, setLiteMode] = useState(localStorage.getItem('astral-lite-mode') === 'true'); useEffect(() => localStorage.setItem('astral-lite-mode', String(liteMode)), [liteMode]); return <MotionContext.Provider value={{ liteMode, setLiteMode }}>{children}</MotionContext.Provider>; }
// This hook reads and updates Lite mode.
export function useMotionSettings() { return useContext(MotionContext); }
