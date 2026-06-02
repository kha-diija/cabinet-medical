import { useTranslation } from '../i18n';

export default function LanguageSwitcher() {
    const { locale, changeLocale } = useTranslation();

    const languages = [
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ar', label: 'العربية', flag: '🇲🇦' },
        { code: 'en', label: 'English', flag: '🇬🇧' }
    ];

    const currentLang = languages.find(l => l.code === locale);

    return (
        <div className="relative group">
            <button className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all flex items-center gap-2 shadow-sm">
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-medium">{currentLang?.label}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLocale(lang.code)}
                        className={`w-full px-4 py-3 text-left hover:bg-cyan-50 dark:hover:bg-slate-700 transition-all flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${
                            locale === lang.code ? 'bg-cyan-50 dark:bg-slate-700 font-semibold text-cyan-600 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {locale === lang.code && (
                            <svg className="w-4 h-4 ml-auto text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}