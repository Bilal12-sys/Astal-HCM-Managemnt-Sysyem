import { createContext, useContext } from 'react';
const ToastContext = createContext({ showToast: () => {} });

// This component reserves one shared toast API for future screens.
export function ToastProvider({ children }) { return <ToastContext.Provider value={{ showToast: (message) => window.alert(message) }}>{children}</ToastContext.Provider>; }
// This hook displays a short shared message.
export function useToast() { return useContext(ToastContext); }
