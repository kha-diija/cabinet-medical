import { useTranslation } from '../../i18n';

export default function CTA({ onLoginClick, onSignupClick }) {
  const { t } = useTranslation();

  return (
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div
              className="
            relative rounded-3xl
            bg-[hsl(var(--color-card))]
            border border-[hsl(var(--color-border))]
            overflow-hidden p-12 md:p-16
          "
          >
            {/* Blobs décoratifs */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-10 right-10 w-64 h-64
              bg-[hsla(var(--color-primary) / 0.15)]
              rounded-full blur-3xl"
              ></div>

              <div className="absolute bottom-10 left-10 w-64 h-64
              bg-[hsla(var(--color-secondary) / 0.15)]
              rounded-full blur-3xl"
              ></div>
            </div>

            <div className="text-center">
              {/* Titre */}
              <h2 className="text-4xl md:text-5xl font-bold
              text-[hsl(var(--color-foreground))] mb-6"
              >
                {t('cta.title')}
              </h2>

              {/* Description */}
              <p className="text-xl
              text-[hsl(var(--color-muted-foreground))]
              mb-8 max-w-2xl mx-auto"
              >
                {t('cta.description')}
              </p>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">

                <button
                    onClick={onLoginClick}
                    className="
                  px-8 py-4
                  bg-[hsl(var(--color-background))]
                  text-[hsl(var(--color-foreground))]
                  border border-[hsl(var(--color-border))]
                  font-semibold rounded-lg
                  hover:bg-[hsl(var(--color-muted))]
                  transition-all
                "
                >
                  {t('cta.loginBtn')}
                </button>

                <button
                    onClick={onSignupClick}
                    className="
                  px-8 py-4
                  bg-[hsl(var(--color-primary))]
                  text-white font-semibold rounded-lg
                  hover:shadow-lg transition-all transform hover:scale-105
                "
                >
                  {t('cta.signupBtn')}
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
