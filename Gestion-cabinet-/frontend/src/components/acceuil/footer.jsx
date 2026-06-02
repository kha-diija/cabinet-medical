import { useTranslation } from '../../i18n';

export default function Footer() {
  const { t } = useTranslation();

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const aboutItems = safeArray(t("footer.about.items"));
  const productItems = safeArray(t("footer.product.items"));
  const supportItems = safeArray(t("footer.support.items"));
  const legalItems = safeArray(t("footer.legal.items"));

  return (
      <footer
          className="
        pt-16 pb-8
        bg-[hsl(var(--color-background))]
        text-[hsl(var(--color-muted-foreground))]
        border-t border-[hsl(var(--color-border))]
      "
      >
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid md:grid-cols-4 gap-8 mb-12">

            {/* À propos */}
            <div>
              <h3 className="font-semibold mb-4 text-[hsl(var(--color-foreground))]">
                {t("footer.about.title")}
              </h3>

              <ul className="space-y-2">
                {aboutItems.map((item, index) => (
                    <li key={index}>
                      <a
                          href="#"
                          className="
                      hover:text-[hsl(var(--color-primary))]
                      transition
                    "
                      >
                        {item}
                      </a>
                    </li>
                ))}
              </ul>
            </div>

            {/* Produit */}
            <div>
              <h3 className="font-semibold mb-4 text-[hsl(var(--color-foreground))]">
                {t("footer.product.title")}
              </h3>

              <ul className="space-y-2">
                {productItems.map((item, index) => (
                    <li key={index}>
                      <a
                          href="#"
                          className="hover:text-[hsl(var(--color-primary))] transition"
                      >
                        {item}
                      </a>
                    </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4 text-[hsl(var(--color-foreground))]">
                {t("footer.support.title")}
              </h3>

              <ul className="space-y-2">
                {supportItems.map((item, index) => (
                    <li key={index}>
                      <a
                          href="#"
                          className="hover:text-[hsl(var(--color-primary))] transition"
                      >
                        {item}
                      </a>
                    </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-[hsl(var(--color-foreground))]">
                {t("footer.legal.title")}
              </h3>

              <ul className="space-y-2">
                {legalItems.map((item, index) => (
                    <li key={index}>
                      <a
                          href="#"
                          className="hover:text-[hsl(var(--color-primary))] transition"
                      >
                        {item}
                      </a>
                    </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-[hsl(var(--color-border))]">
            <div className="text-center text-[hsl(var(--color-muted-foreground))]">
              <p>&copy; 2025 MediCore. {t("footer.copyright")}</p>
            </div>
          </div>

        </div>
      </footer>
  );
}
