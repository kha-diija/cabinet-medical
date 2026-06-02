// src/medecin/contexts/themeConstants.js

export const colorPalettes = {
    blue: {
        name: 'Bleu Médical',
        primary: '#1a73e8',
        secondary: '#e8f0fe',
        accent: '#4285f4',
        text: '#202124',
        textLight: '#5f6368',
        background: '#ffffff',
        sidebar: '#1e40af',
        sidebarLight: '#3b82f6',
        card: '#ffffff',
        border: '#e0e0e0',
        isDark: false
    },
    green: {
        name: 'Vert Naturel',
        primary: '#10b981',
        secondary: '#d1fae5',
        accent: '#34d399',
        text: '#065f46',
        textLight: '#047857',
        background: '#f9fafb',
        sidebar: '#047857',
        sidebarLight: '#10b981',
        card: '#ffffff',
        border: '#d1fae5',
        isDark: false
    },
    purple: {
        name: 'Violet Professionnel',
        primary: '#8b5cf6',
        secondary: '#ede9fe',
        accent: '#a78bfa',
        text: '#5b21b6',
        textLight: '#7c3aed',
        background: '#faf5ff',
        sidebar: '#7c3aed',
        sidebarLight: '#8b5cf6',
        card: '#ffffff',
        border: '#ddd6fe',
        isDark: false
    },
    red: {
        name: 'Rouge Urgence',
        primary: '#ef4444',
        secondary: '#fee2e2',
        accent: '#f87171',
        text: '#7f1d1d',
        textLight: '#991b1b',
        background: '#fef2f2',
        sidebar: '#dc2626',
        sidebarLight: '#ef4444',
        card: '#ffffff',
        border: '#fca5a5',
        isDark: false
    },
    teal: {
        name: 'Bleu-Vert Moderne',
        primary: '#14b8a6',
        secondary: '#ccfbf1',
        accent: '#5eead4',
        text: '#134e4a',
        textLight: '#0f766e',
        background: '#f0fdfa',
        sidebar: '#0f766e',
        sidebarLight: '#14b8a6',
        card: '#ffffff',
        border: '#99f6e4',
        isDark: false
    },
    orange: {
        name: 'Orange Dynamique',
        primary: '#f97316',
        secondary: '#fed7aa',
        accent: '#fb923c',
        text: '#7c2d12',
        textLight: '#9a3412',
        background: '#fff7ed',
        sidebar: '#ea580c',
        sidebarLight: '#f97316',
        card: '#ffffff',
        border: '#fdba74',
        isDark: false
    },
    indigo: {
        name: 'Indigo Élégant',
        primary: '#6366f1',
        secondary: '#e0e7ff',
        accent: '#818cf8',
        text: '#312e81',
        textLight: '#4338ca',
        background: '#f5f7ff',
        sidebar: '#4f46e5',
        sidebarLight: '#6366f1',
        card: '#ffffff',
        border: '#c7d2fe',
        isDark: false
    },
    pink: {
        name: 'Rose Moderne',
        primary: '#ec4899',
        secondary: '#fce7f3',
        accent: '#f472b6',
        text: '#831843',
        textLight: '#9f1239',
        background: '#fdf2f8',
        sidebar: '#db2777',
        sidebarLight: '#ec4899',
        card: '#ffffff',
        border: '#fbcfe8',
        isDark: false
    },
    amber: {
        name: 'Ambre Chaleureux',
        primary: '#f59e0b',
        secondary: '#fef3c7',
        accent: '#fbbf24',
        text: '#78350f',
        textLight: '#92400e',
        background: '#fffbeb',
        sidebar: '#d97706',
        sidebarLight: '#f59e0b',
        card: '#ffffff',
        border: '#fde68a',
        isDark: false
    },
    cyan: {
        name: 'Cyan Frais',
        primary: '#06b6d4',
        secondary: '#cffafe',
        accent: '#22d3ee',
        text: '#164e63',
        textLight: '#155e75',
        background: '#ecfeff',
        sidebar: '#0891b2',
        sidebarLight: '#06b6d4',
        card: '#ffffff',
        border: '#a5f3fc',
        isDark: false
    },
    slate: {
        name: 'Ardoise Neutre',
        primary: '#64748b',
        secondary: '#f1f5f9',
        accent: '#94a3b8',
        text: '#1e293b',
        textLight: '#334155',
        background: '#f8fafc',
        sidebar: '#475569',
        sidebarLight: '#64748b',
        card: '#ffffff',
        border: '#cbd5e1',
        isDark: false
    },
    // MODE SOMBRE - Couleurs adaptées
    dark: {
        name: 'Mode Sombre',
        primary: '#60a5fa',
        secondary: '#1f2937',
        accent: '#3b82f6',
        text: '#f3f4f6',
        textLight: '#d1d5db',
        background: '#111827',
        sidebar: '#1f2937',
        sidebarLight: '#374151',
        card: '#1f2937',
        border: '#374151',
        isDark: true
    },
    darkPurple: {
        name: 'Sombre Violet',
        primary: '#a78bfa',
        secondary: '#1e1b4b',
        accent: '#8b5cf6',
        text: '#f5f3ff',
        textLight: '#ddd6fe',
        background: '#0f0a1e',
        sidebar: '#312e81',
        sidebarLight: '#4c1d95',
        card: '#1e1b4b',
        border: '#4c1d95',
        isDark: true
    },
    darkGreen: {
        name: 'Sombre Vert',
        primary: '#34d399',
        secondary: '#064e3b',
        accent: '#10b981',
        text: '#d1fae5',
        textLight: '#a7f3d0',
        background: '#022c22',
        sidebar: '#065f46',
        sidebarLight: '#047857',
        card: '#064e3b',
        border: '#047857',
        isDark: true
    },
    midnight: {
        name: 'Minuit Profond',
        primary: '#38bdf8',
        secondary: '#0c4a6e',
        accent: '#0ea5e9',
        text: '#e0f2fe',
        textLight: '#bae6fd',
        background: '#020617',
        sidebar: '#0c4a6e',
        sidebarLight: '#075985',
        card: '#0c4a6e',
        border: '#075985',
        isDark: true
    }
};

// Fonction utilitaire pour déterminer si une couleur est claire ou sombre
export const isColorLight = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
};

// Fonction pour obtenir une couleur de texte contrastée
export const getContrastColor = (backgroundColor) => {
    return isColorLight(backgroundColor) ? '#1f2937' : '#f9fafb';
};

// Variables CSS par défaut
export const defaultThemeVariables = {
    primary: 'var(--primary-color)',
    secondary: 'var(--secondary-color)',
    accent: 'var(--accent-color)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    backgroundPrimary: 'var(--background-primary)',
    backgroundSecondary: 'var(--background-secondary)',
    backgroundCard: 'var(--background-card)',
    border: 'var(--border-color)',
    shadow: 'var(--shadow-color)',
    hover: 'var(--hover-color)',
    active: 'var(--active-color)',
    
    // Sidebar2
    sidebarGradientStart: 'var(--sidebar-gradient-start)',
    sidebarGradientEnd: 'var(--sidebar-gradient-end)',
    sidebarText: 'var(--sidebar-text)',
    sidebarTextSecondary: 'var(--sidebar-text-secondary)',
    sidebarTitle: 'var(--sidebar-title)',
    sidebarBorder: 'var(--sidebar-border)',
    sidebarHover: 'var(--sidebar-hover)',
    sidebarActiveStart: 'var(--sidebar-active-start)',
    sidebarActiveEnd: 'var(--sidebar-active-end)',
    sidebarActiveText: 'var(--sidebar-active-text)',
    sidebarActiveBorder: 'var(--sidebar-active-border)',
    sidebarShadow: 'var(--sidebar-shadow)',
    badgeColor: 'var(--badge-color)'
};

// Configuration des transitions
export const themeTransitions = {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
    all: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
};

// Breakpoints responsive
export const breakpoints = {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultraWide: '1536px'
};

// Espacements standards
export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
};

// Tailles de police
export const fontSizes = {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px'
};

// Shadow presets
export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 var(--shadow-color)',
    md: '0 4px 6px -1px var(--shadow-color)',
    lg: '0 10px 15px -3px var(--shadow-color)',
    xl: '0 20px 25px -5px var(--shadow-color)',
    xxl: '0 25px 50px -12px var(--shadow-color)'
};

// Border radius presets
export const borderRadius = {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    full: '9999px'
};

// Catégories de palettes pour faciliter l'organisation
export const paletteCategories = {
    light: ['blue', 'green', 'purple', 'red', 'teal', 'orange', 'indigo', 'pink', 'amber', 'cyan', 'slate'],
    dark: ['dark', 'darkPurple', 'darkGreen', 'midnight']
};

// Fonction helper pour obtenir toutes les palettes d'une catégorie
export const getPalettesByCategory = (category) => {
    return paletteCategories[category]?.map(key => ({
        key,
        ...colorPalettes[key]
    })) || [];
};