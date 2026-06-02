import { useTranslation } from '../../i18n';

export default function Features() {
    const { t } = useTranslation();

    const features = [
        { icon: '👥', key: 'patients' },
        { icon: '📅', key: 'appointments' },
        { icon: '❤️', key: 'records' },
        { icon: '📊', key: 'analytics' },
        { icon: '🔒', key: 'security' },
        { icon: '🔐', key: 'access' }
    ];

    return (
        <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4" style={{ color: "hsl(var(--color-foreground))" }}>
                    {t('features.title')}
                </h2>
                <p className="text-xl" style={{ color: "hsl(var(--color-foreground)) / 0.7" }}>
                    {t('features.subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-2xl glass-hover group"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            backgroundColor: "hsl(var(--color-card))",
                            borderColor: "hsl(var(--color-border))",
                            color: "hsl(var(--color-card-foreground))"
                        }}
                    >
                        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: "hsl(var(--color-card-foreground))" }}>
                            {t(`features.items.${feature.key}.title`)}
                        </h3>
                        <p style={{ color: "hsl(var(--color-card-foreground)) / 0.7" }}>
                            {t(`features.items.${feature.key}.description`)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
