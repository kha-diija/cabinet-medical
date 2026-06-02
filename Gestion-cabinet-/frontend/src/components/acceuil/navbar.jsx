import { useTranslation } from '../../i18n';
import ThemeSwitcher from '../ThemeSwitcher';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Navbar({ onLoginClick, onSignupClick }) {
  const { t } = useTranslation();

  return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img
                    src="/logo-medicore.png"
                    alt="MediCore Logo"
                    className="w-10 h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeSwitcher />

              <button
                  onClick={onLoginClick}
                  className="px-6 py-2 text-slate-700 dark:text-slate-300 font-medium hover:text-cyan-500 transition-colors"
              >
                {t('nav.login')}
              </button>

              <button
                  onClick={onSignupClick}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                {t('nav.signup')}
              </button>
            </div>
          </div>
        </div>
      </nav>
  );
}