import { User, Phone, Mail, CreditCard } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function StepSecretaire({ formData, updateFormData, errors }) {
    const { t } = useTranslation();

    // Style de base pour les inputs basés sur vos variables CSS
    const inputClassName = (hasError) => `
        w-full px-4 py-3 rounded-lg 
        bg-[hsl(var(--color-background))] 
        border 
        ${hasError ? 'border-red-500' : 'border-[hsl(var(--color-input))]'} 
        text-[hsl(var(--color-foreground))] 
        placeholder:text-[hsl(var(--color-foreground))]/50 
        focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent 
        transition-all duration-200 
        hover:border-[hsl(var(--color-primary))]/50
    `;

    // Style pour les labels
    const labelClassName = "font-medium text-[hsl(var(--color-foreground))] text-sm";

    // Style pour les icônes à l'intérieur des inputs
    const iconClassName = "absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/50 pointer-events-none";

    return (
        <div className="space-y-8 p-1">
            {/* Header2 */}
            <div className="border-b border-[hsl(var(--color-border))] pb-3">
                <h2 className="text-2xl font-extrabold gradient-text flex items-center gap-2">
                    🧑‍💼 {t('signup.secretary.title')}
                </h2>
            </div>

            {/* Checkbox pour inclure la secrétaire */}
            <div className="flex items-center space-x-3 p-4 border rounded-lg bg-[hsl(var(--color-background-alt))] border-[hsl(var(--color-border))]">
                <input
                    id="includeSecretaire"
                    type="checkbox"
                    checked={formData.includeSecretaire}
                    onChange={(e) => updateFormData("includeSecretaire", e.target.checked)}
                    className="h-5 w-5 text-[hsl(var(--color-primary))] rounded border-[hsl(var(--color-input))] focus:ring-[hsl(var(--color-primary))]"
                />
                <label htmlFor="includeSecretaire" className="text-lg font-medium text-[hsl(var(--color-foreground))] cursor-pointer">
                    {t('signup.secretary.checkbox')}
                </label>
            </div>

            {/* Formulaire Secrétaire conditionnel */}
            {formData.includeSecretaire && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 p-4 border border-dashed border-[hsl(var(--color-border))] rounded-lg">

                    <h3 className="text-xl font-semibold md:col-span-2 text-[hsl(var(--color-foreground))]">
                        {t('signup.secretary.details')} <span className="text-red-500">*</span>
                    </h3>

                    {/* Nom */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            {t('signup.secretary.lastName')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={20} className={iconClassName} />
                            <input
                                type="text"
                                required
                                placeholder={t('signup.secretary.lastNamePlaceholder')}
                                value={formData.nomSecretaire}
                                onChange={(e) => updateFormData("nomSecretaire", e.target.value)}
                                className={`${inputClassName(errors.nomSecretaire)} pl-10`}
                            />
                        </div>
                        {errors.nomSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.nomSecretaire}</p>}
                    </div>

                    {/* Prénom */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            {t('signup.secretary.firstName')} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={20} className={iconClassName} />
                            <input
                                type="text"
                                required
                                placeholder={t('signup.secretary.firstNamePlaceholder')}
                                value={formData.prenomSecretaire}
                                onChange={(e) => updateFormData("prenomSecretaire", e.target.value)}
                                className={`${inputClassName(errors.prenomSecretaire)} pl-10`}
                            />
                        </div>
                        {errors.prenomSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.prenomSecretaire}</p>}
                    </div>

                    {/* CIN */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>{t('signup.secretary.cin')}</label>
                        <input
                            type="text"
                            placeholder={t('signup.secretary.cinPlaceholder')}
                            value={formData.cinSecretaire}
                            onChange={(e) => updateFormData("cinSecretaire", e.target.value)}
                            className={inputClassName(errors.cinSecretaire)}
                        />
                        {errors.cinSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.cinSecretaire}</p>}
                    </div>

                    {/* Téléphone */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>{t('signup.secretary.phone')}</label>
                        <div className="relative">
                            <Phone size={20} className={iconClassName} />
                            <input
                                type="tel"
                                placeholder={t('signup.secretary.phonePlaceholder')}
                                value={formData.telSecretaire}
                                onChange={(e) => updateFormData("telSecretaire", e.target.value)}
                                className={`${inputClassName(errors.telSecretaire)} pl-10`}
                            />
                        </div>
                        {errors.telSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.telSecretaire}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>{t('signup.secretary.email')}</label>
                        <div className="relative">
                            <Mail size={20} className={iconClassName} />
                            <input
                                type="email"
                                placeholder={t('signup.secretary.emailPlaceholder')}
                                value={formData.emailSecretaire}
                                onChange={(e) => updateFormData("emailSecretaire", e.target.value)}
                                className={`${inputClassName(errors.emailSecretaire)} pl-10`}
                            />
                        </div>
                        {errors.emailSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.emailSecretaire}</p>}
                    </div>

                    {/* Login */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            {t('signup.secretary.login')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={t('signup.secretary.loginPlaceholder')}
                            value={formData.loginSecretaire}
                            onChange={(e) => updateFormData("loginSecretaire", e.target.value)}
                            className={inputClassName(errors.loginSecretaire)}
                        />
                        {errors.loginSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.loginSecretaire}</p>}
                    </div>

                    {/* Mot de passe */}
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            {t('signup.secretary.password')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            placeholder={t('signup.secretary.passwordPlaceholder')}
                            value={formData.pwdSecretaire}
                            onChange={(e) => updateFormData("pwdSecretaire", e.target.value)}
                            className={inputClassName(errors.pwdSecretaire)}
                        />
                        {errors.pwdSecretaire && <p className="text-sm text-red-500 flex items-center gap-1">⚠️ {errors.pwdSecretaire}</p>}
                    </div>

                </div>
            )}
        </div>
    );
}