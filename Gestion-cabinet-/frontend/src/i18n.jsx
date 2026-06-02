import { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext();

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useTranslation must be used within I18nProvider');
    return context;
};

export const I18nProvider = ({ children }) => {
    const [locale, setLocale] = useState(() => {
        return localStorage.getItem('locale') || 'fr';
    });
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const data = await import(`./locales/${locale}.json`);
                setTranslations(data.default);
            } catch (error) {
                console.error('Error loading translations:', error);
            }
        };
        loadTranslations();
    }, [locale]);

    const changeLocale = (newLocale) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale;
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations;
        for (const k of keys) {
            value = value?.[k];
            if (!value) return key;
        }
        return value;
    };

    return (
        <I18nContext.Provider value={{ locale, changeLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
};