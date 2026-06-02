// src/medecin/contexts/useTheme.js
import { useContext } from 'react';
import { ThemeContext, ThemeProvider as OriginalThemeProvider } from './ThemeContext';

// Réexporter le ThemeProvider
export const ThemeProvider = OriginalThemeProvider;

// Hook useTheme
export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
    }

    return context;
};