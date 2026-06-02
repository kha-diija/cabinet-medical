/**
 * COMPOSANT TESTIMONIALS CAROUSEL
 * Carrousel de témoignages avec notes 5 étoiles
 */

import { useState, useEffect } from 'react';
import { useTranslation } from "../../i18n";

export default function TestimonialsCarousel() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ Charger les témoignages depuis les traductions
  const testimonials = t("testimonials.items", { returnObjects: true });

  useEffect(() => {
    if (!Array.isArray(testimonials) || testimonials.length === 0 || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, testimonials]);

  const goToPrevious = () => {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return;
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return;
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center">
            <p>Chargement des témoignages...</p>
          </div>
        </section>
    );
  }

  return (
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[hsl(var(--color-foreground))] mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-xl text-[hsl(var(--color-foreground))]/70">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div
            className="relative rounded-3xl p-8 md:p-12 border"
            style={{
              backgroundColor: "hsl(var(--color-card))",
              borderColor: "hsl(var(--color-border))"
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
          <div className="text-center">
            <div className="flex flex-col items-center mb-8">
              {testimonials[current].image && (
                  <img
                      src={testimonials[current].image}
                      alt={testimonials[current].name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                  />
              )}

              <h3 className="text-xl font-semibold text-[hsl(var(--color-foreground))]">
                {testimonials[current].name}
              </h3>

              <p className="text-[hsl(var(--color-foreground))]/70 mb-4">
                {testimonials[current].role}
              </p>

              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>

            <p className="text-lg italic text-[hsl(var(--color-foreground))] mb-8 max-w-2xl mx-auto">
              "{testimonials[current].comment}"
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
                onClick={goToPrevious}
                className="p-2 rounded-full shadow-md transition-all"
                style={{ backgroundColor: "hsl(var(--color-card))" }}
            >
              ←
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                  <button
                      key={index}
                      onClick={() => setCurrent(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === current ? 'w-8' : ''}`}
                      style={{
                        backgroundColor: index === current
                            ? "hsl(var(--color-primary))"
                            : "hsl(var(--color-border))"
                      }}
                  />
              ))}
            </div>

            <button
                onClick={goToNext}
                className="p-2 rounded-full shadow-md transition-all"
                style={{ backgroundColor: "hsl(var(--color-card))" }}
            >
              →
            </button>
          </div>
        </div>
      </section>
  );
}
