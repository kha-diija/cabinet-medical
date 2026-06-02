// src/medecin/contexts/ThemeContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { colorPalettes, getContrastColor } from './themeConstants';


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [currentPalette, setCurrentPalette] = useState('blue');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Charger le thème sauvegardé au montage
    useEffect(() => {
        const savedPalette = localStorage.getItem('themePalette') || 'blue';
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        setCurrentPalette(savedPalette);
        setIsDarkMode(savedDarkMode);
        applyTheme(savedPalette, savedDarkMode);
    }, []);

    // Appliquer le thème au DOM avec gestion automatique des couleurs
    const applyTheme = (paletteName, darkMode) => {
        const palette = colorPalettes[paletteName];
        
        if (!palette) {
            console.error(`Palette "${paletteName}" non trouvée`);
            return;
        }
        
        const root = document.documentElement;
        
        // Déterminer si on force le mode sombre basé sur la palette
        const isDarkPalette = palette.isDark || darkMode;
        
        // Variables principales
        root.style.setProperty('--primary-color', palette.primary);
        root.style.setProperty('--secondary-color', palette.secondary);
        root.style.setProperty('--accent-color', palette.accent);
        
        // Couleurs de texte - GESTION AUTOMATIQUE
        // Si mode sombre ou palette sombre, utiliser texte clair
        if (isDarkPalette) {
            root.style.setProperty('--text-primary', palette.text);
            root.style.setProperty('--text-secondary', palette.textLight);
        } else {
            // Mode clair, utiliser le texte de la palette
            root.style.setProperty('--text-primary', palette.text);
            root.style.setProperty('--text-secondary', palette.textLight);
        }
        
        // Arrière-plans
        root.style.setProperty('--background-primary', isDarkPalette ? palette.background : palette.background);
        root.style.setProperty('--background-secondary', isDarkPalette ? palette.card : palette.secondary);
        root.style.setProperty('--background-card', palette.card);
        
        // Bordures et ombres adaptées au mode
        root.style.setProperty('--border-color', palette.border);
        root.style.setProperty('--shadow-color', isDarkPalette ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)');
        
        // États - couleurs adaptées
        if (isDarkPalette) {
            root.style.setProperty('--hover-color', palette.sidebarLight);
            root.style.setProperty('--active-color', palette.sidebar);
        } else {
            root.style.setProperty('--hover-color', palette.secondary);
            root.style.setProperty('--active-color', palette.border);
        }
        
        // Variables Sidebar2 avec dégradés
        root.style.setProperty('--sidebar-gradient-start', palette.sidebar);
        root.style.setProperty('--sidebar-gradient-end', palette.sidebarLight);
        
        // Texte de la sidebar - toujours blanc ou adapté selon le fond
        const sidebarTextColor = getContrastColor(palette.sidebar);
        root.style.setProperty('--sidebar-text', sidebarTextColor);
        root.style.setProperty('--sidebar-text-secondary', isDarkPalette ? '#cbd5e1' : 'rgba(255, 255, 255, 0.8)');
        root.style.setProperty('--sidebar-title', sidebarTextColor);
        
        // Bordures sidebar
        root.style.setProperty('--sidebar-border', isDarkPalette ? palette.border : 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--sidebar-hover', isDarkPalette ? palette.sidebarLight : 'rgba(255, 255, 255, 0.15)');
        
        // Item actif de la sidebar
        root.style.setProperty('--sidebar-active-start', palette.accent);
        root.style.setProperty('--sidebar-active-end', palette.primary);
        root.style.setProperty('--sidebar-active-text', getContrastColor(palette.accent));
        root.style.setProperty('--sidebar-active-border', palette.accent);
        root.style.setProperty('--sidebar-shadow', `${palette.accent}4D`); // 30% opacity
        
        // Badge toujours rouge pour visibilité
        root.style.setProperty('--badge-color', '#ef4444');
        
        // Appliquer au body
        document.body.style.backgroundColor = palette.background;
        document.body.style.color = palette.text;
        
        // Classes pour les thèmes spéciaux
        document.body.classList.toggle('dark-theme', isDarkPalette);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('themePalette', paletteName);
        localStorage.setItem('darkMode', darkMode);
    };

    // Changer de palette de couleurs
    const changePalette = (paletteName) => {
        if (!colorPalettes[paletteName]) {
            console.error(`Palette "${paletteName}" non disponible`);
            return;
        }
        
        setCurrentPalette(paletteName);
        
        // Si c'est une palette sombre, activer le mode sombre automatiquement
        const palette = colorPalettes[paletteName];
        if (palette.isDark) {
            setIsDarkMode(true);
            applyTheme(paletteName, true);
        } else {
            applyTheme(paletteName, isDarkMode);
        }
    };

    // Basculer le mode sombre/clair
    const toggleDarkMode = () => {
        const palette = colorPalettes[currentPalette];
        
        // Empêcher de désactiver le mode sombre pour les palettes sombres
        if (palette.isDark && !isDarkMode) {
            console.log('Cette palette est conçue pour le mode sombre');
            return;
        }
        
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        applyTheme(currentPalette, newDarkMode);
    };

    // Réinitialiser au thème par défaut
    const resetTheme = () => {
        setCurrentPalette('blue');
        setIsDarkMode(false);
        applyTheme('blue', false);
    };

    // Obtenir la palette actuelle
    const getCurrentPalette = () => {
        return colorPalettes[currentPalette];
    };

    // Obtenir les palettes par catégorie
const getPalettesByType = (type) => {
    return Object.entries(colorPalettes)
        .filter(([, palette]) => type === 'dark' ? palette.isDark : !palette.isDark)
        .map(([key, palette]) => ({ key, ...palette }));
};

    const value = {
        currentPalette,
        colorPalettes,
        isDarkMode,
        changePalette,
        toggleDarkMode,
        resetTheme,
        getCurrentPalette,
        getPalettesByType
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider');
    }
    return context;
};

export { ThemeContext };