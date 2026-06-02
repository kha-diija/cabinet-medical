import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n';

export default function Hero({ onLoginClick, onSignupClick }) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
      <section
          className="
        relative min-h-screen flex items-center justify-center pt-20 overflow-hidden
        bg-[hsl(var(--color-background))]
      "
      >
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72
          bg-[hsl(var(--color-primary))]/20
          rounded-full blur-3xl animate-pulse-glow"
          ></div>

          <div className="absolute bottom-20 right-10 w-96 h-96
          bg-[hsl(var(--color-primary))]/10
          rounded-full blur-3xl animate-pulse-glow animation-delay-2000"
          ></div>
        </div>

        <div
            className={`text-center max-w-4xl mx-auto px-4 transition-all duration-1000
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold
          text-[hsl(var(--color-foreground))]
          mb-6 leading-tight"
          >
            {t('hero.title')}
            <span className="gradient-text block mt-2">{t('hero.subtitle')}</span>
          </h1>

          {/* Description */}
          <p className="text-xl
          text-[hsl(var(--color-muted-foreground))]
          mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.description')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
                onClick={onLoginClick}
                className="
              px-8 py-4
              bg-[hsl(var(--color-card))]
              border-2 border-[hsl(var(--color-border))]
              text-[hsl(var(--color-foreground))]
              font-semibold rounded-lg
              hover:border-[hsl(var(--color-primary))]
              hover:shadow-lg transition-all
            "
            >
              {t('hero.loginBtn')}
            </button>

            <button
                onClick={onSignupClick}
                className="
              px-8 py-4
              bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary))]
              text-white font-semibold rounded-lg
              hover:shadow-lg transition-all transform hover:scale-105
            "
            >
              {t('hero.signupBtn')}
            </button>
          </div>

          {/* Stats */}
          <div
              className="
            grid grid-cols-3 gap-4 mt-16 pt-16
            border-t border-[hsl(var(--color-border))]
          "
          >
            <div className="text-center animate-fade-in-up">
              <p className="text-3xl font-bold gradient-text">500+</p>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                {t('hero.stats.clinics')}
              </p>
            </div>

            <div className="text-center animate-fade-in-up animation-delay-1000">
              <p className="text-3xl font-bold gradient-text">50k+</p>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                {t('hero.stats.patients')}
              </p>
            </div>

            <div className="text-center animate-fade-in-up animation-delay-2000">
              <p className="text-3xl font-bold gradient-text">99.9%</p>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                {t('hero.stats.uptime')}
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}
