import { MapPin, Phone, Mail, Stethoscope, Upload, AlertCircle, Building } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function StepCabinet({ formData, updateFormData, errors }) {
    const { t } = useTranslation();

    // Style de base pour les inputs (identique à StepMedecin)
    const inputClassName = (hasError) => `
        w-full px-4 py-3 rounded-lg 
        bg-[hsl(var(--color-background))] 
        border 
        ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-[hsl(var(--color-input))]'} 
        text-[hsl(var(--color-foreground))] 
        placeholder:text-[hsl(var(--color-foreground))]/50 
        focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent 
        transition-all duration-200 
        hover:border-[hsl(var(--color-primary))]/50
    `;

    // Style pour les labels
    const labelClassName = "font-medium text-[hsl(var(--color-foreground))] text-sm flex items-center justify-between";

    // Composant pour afficher l'erreur
    const ErrorMessage = ({ errorKey }) => {
        if (!errorKey) return null;
        return (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-pulse">
                <AlertCircle size={12} />
                {t(`signup.cabinet.errors.${errorKey}`) || errorKey || t('signup.cabinet.errors.required')}
            </p>
        );
    };

    return (
        <div className="space-y-6 p-1">
            {/* Header2 avec Alerte d'information */}
            <div className="border-b border-[hsl(var(--color-border))] pb-3 space-y-2">
                <h2 className="text-2xl font-extrabold gradient-text flex items-center gap-2">
                    🏥 {t('signup.cabinet.title')}
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    <AlertCircle size={18} />
                    <span>{t('signup.cabinet.mandatoryFields')}</span>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">

                {/* Nom du Cabinet */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                    <label htmlFor="nomCabinet" className={labelClassName}>
                        <span>{t('signup.cabinet.name')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <Building size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none" />
                        <input
                            id="nomCabinet"
                            type="text"
                            required
                            placeholder={t('signup.cabinet.namePlaceholder')}
                            value={formData.nomCabinet}
                            onChange={(e) => updateFormData("nomCabinet", e.target.value)}
                            className={`${inputClassName(errors.nomCabinet)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.nomCabinet} />
                </div>

                {/* Spécialité */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="specialite" className={labelClassName}>
                        <span>{t('signup.cabinet.specialty')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <Stethoscope
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none z-10"
                        />
                        <select
                            id="specialite"
                            required
                            value={formData.specialite}
                            onChange={(e) => updateFormData("specialite", e.target.value)}
                            className={`${inputClassName(errors.specialite)} pl-10 appearance-none cursor-pointer`}
                        >
                            <option value="" disabled>{t('signup.cabinet.specialtyPlaceholder')}</option>
                            <option value="general">{t('signup.cabinet.specialties.general')}</option>
                            <option value="cardiology">{t('signup.cabinet.specialties.cardiology')}</option>
                            <option value="dermatology">{t('signup.cabinet.specialties.dermatology')}</option>
                            <option value="orthopedics">{t('signup.cabinet.specialties.orthopedics')}</option>
                            <option value="pediatrics">{t('signup.cabinet.specialties.pediatrics')}</option>
                            <option value="gynecology">{t('signup.cabinet.specialties.gynecology')}</option>
                            <option value="ophthalmology">{t('signup.cabinet.specialties.ophthalmology')}</option>
                            <option value="ent">{t('signup.cabinet.specialties.ent')}</option>
                            <option value="neurology">{t('signup.cabinet.specialties.neurology')}</option>
                            <option value="psychiatry">{t('signup.cabinet.specialties.psychiatry')}</option>
                            <option value="gastroenterology">{t('signup.cabinet.specialties.gastroenterology')}</option>
                            <option value="pulmonology">{t('signup.cabinet.specialties.pulmonology')}</option>
                            <option value="urology">{t('signup.cabinet.specialties.urology')}</option>
                            <option value="nephrology">{t('signup.cabinet.specialties.nephrology')}</option>
                            <option value="endocrinology">{t('signup.cabinet.specialties.endocrinology')}</option>
                            <option value="rheumatology">{t('signup.cabinet.specialties.rheumatology')}</option>
                            <option value="oncology">{t('signup.cabinet.specialties.oncology')}</option>
                            <option value="surgery">{t('signup.cabinet.specialties.surgery')}</option>
                            <option value="plastic_surgery">{t('signup.cabinet.specialties.plastic_surgery')}</option>
                            <option value="radiology">{t('signup.cabinet.specialties.radiology')}</option>
                            <option value="anesthesiology">{t('signup.cabinet.specialties.anesthesiology')}</option>
                            <option value="dentistry">{t('signup.cabinet.specialties.dentistry')}</option>
                            <option value="physiotherapy">{t('signup.cabinet.specialties.physiotherapy')}</option>
                            <option value="nutrition">{t('signup.cabinet.specialties.nutrition')}</option>
                            <option value="biology">{t('signup.cabinet.specialties.biology')}</option>




                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[hsl(var(--color-foreground))]/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <ErrorMessage errorKey={errors.specialite} />
                </div>

                {/* Téléphone Cabinet */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="telCabinet" className={labelClassName}>
                        <span>{t('signup.cabinet.phone')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <Phone
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none"
                        />
                        <input
                            id="telCabinet"
                            type="tel"
                            required
                            placeholder={t('signup.cabinet.phonePlaceholder')}
                            value={formData.telCabinet}
                            onChange={(e) => updateFormData("telCabinet", e.target.value)}
                            className={`${inputClassName(errors.telCabinet)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.telCabinet} />
                </div>

                {/* Email Cabinet */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                    <label htmlFor="emailCabinet" className={labelClassName}>
                        <span>{t('signup.cabinet.email')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <Mail
                            size={20}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none"
                        />
                        <input
                            id="emailCabinet"
                            type="email"
                            required
                            placeholder={t('signup.cabinet.emailPlaceholder')}
                            value={formData.emailCabinet}
                            onChange={(e) => updateFormData("emailCabinet", e.target.value)}
                            className={`${inputClassName(errors.emailCabinet)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.emailCabinet} />
                </div>

                {/* Adresse Cabinet */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                    <label htmlFor="adresseCabinet" className={labelClassName}>
                        <span>{t('signup.cabinet.address')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <MapPin
                            size={20}
                            className="absolute left-3 top-3 text-[hsl(var(--color-foreground))]/40 pointer-events-none"
                        />
                        <textarea
                            id="adresseCabinet"
                            rows="3"
                            required
                            placeholder={t('signup.cabinet.addressPlaceholder')}
                            value={formData.adresseCabinet}
                            onChange={(e) => updateFormData("adresseCabinet", e.target.value)}
                            className={`${inputClassName(errors.adresseCabinet)} pl-10 resize-none`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.adresseCabinet} />
                </div>

                {/* Logo Cabinet (Optionnel) */}
                <div className="flex flex-col space-y-2 md:col-span-2 pt-2">
                    <label htmlFor="logoCabinet" className={labelClassName}>
                        <span className="flex items-center gap-2">
                            {t('signup.cabinet.logo')}
                        </span>
                        <span className="text-[hsl(var(--color-foreground))]/50 text-xs italic">({t('signup.cabinet.optional')})</span>
                    </label>
                    <div className="relative">
                        <input
                            id="logoCabinet"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => updateFormData("logoCabinet", e.target.files[0])}
                            className="hidden"
                        />
                        <label
                            htmlFor="logoCabinet"
                            className={`
                                flex items-center justify-center gap-2 w-full px-4 py-4 rounded-lg
                                bg-[hsl(var(--color-background))]
                                border-2 border-dashed border-[hsl(var(--color-input))]
                                text-[hsl(var(--color-foreground))]/70
                                hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-background-alt))]
                                hover:text-[hsl(var(--color-primary))]
                                transition-all duration-200
                                cursor-pointer
                            `}
                        >
                            <Upload size={20} />
                            <span className="text-sm font-medium">
                                {formData.logoCabinet ? formData.logoCabinet.name : t('signup.cabinet.logoPlaceholder')}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-[hsl(var(--color-foreground))]/60 flex items-center gap-1 justify-center mt-1">
                        <span>💡</span> {t('signup.cabinet.logoHelp')}
                    </p>
                </div>
            </div>
        </div>
    );
}