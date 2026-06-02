import { useTheme } from '../hooks/useTheme';

export default function ThemeSwitcher() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="
                p-2.5 rounded-lg
                bg-[hsl(var(--color-card))]
                text-[hsl(var(--color-foreground))]
                border border-[hsl(var(--color-border))]
                hover:border-cyan-500 dark:hover:border-cyan-400
                transition-all shadow-sm
            "
            aria-label="Toggle theme"
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
            <span className="text-xl">{isDark ? '🌙' :'🌞' }</span>
        </button>
    );
}
