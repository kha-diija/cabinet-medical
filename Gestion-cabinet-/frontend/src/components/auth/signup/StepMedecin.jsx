import { Upload, User, Mail, Phone, FileText, AlertCircle, FileBadge, IdCard } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function StepMedecin({ formData, updateFormData, errors }) {
    const { t } = useTranslation();

    // Style de base pour les inputs
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
        // On suppose que 'errors' contient soit le message direct, soit on affiche un message par défaut traduit
        return (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-pulse">
                <AlertCircle size={12} />
                {t(`signup.doctor.errors.${errorKey}`) || errorKey || t('signup.doctor.errors.required')}
            </p>
        );
    };

    return (
        <div className="space-y-6 p-1">
            {/* Header2 avec Alerte d'information */}
            <div className="border-b border-[hsl(var(--color-border))] pb-3 space-y-2">
                <h2 className="text-2xl font-extrabold gradient-text flex items-center gap-2">
                    👨‍⚕️ {t('signup.doctor.title')}
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    <AlertCircle size={18} />
                    <span>{t('signup.doctor.mandatoryFields')}</span>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">

                {/* Nom */}
                <div className="flex flex-col space-y-2">
                    <label className={labelClassName}>
                        <span>{t('signup.doctor.lastName')} <span className="text-red-500">*</span></span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder={t('signup.doctor.lastNamePlaceholder')}
                        value={formData.nomMedecin}
                        onChange={(e) => updateFormData("nomMedecin", e.target.value)}
                        className={inputClassName(errors.nomMedecin)}
                    />
                    <ErrorMessage errorKey={errors.nomMedecin} />
                </div>

                {/* Prénom */}
                <div className="flex flex-col space-y-2">
                    <label className={labelClassName}>
                        <span>{t('signup.doctor.firstName')} <span className="text-red-500">*</span></span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder={t('signup.doctor.firstNamePlaceholder')}
                        value={formData.prenomMedecin}
                        onChange={(e) => updateFormData("prenomMedecin", e.target.value)}
                        className={inputClassName(errors.prenomMedecin)}
                    />
                    <ErrorMessage errorKey={errors.prenomMedecin} />
                </div>

                {/* CIN */}
                <div className="flex flex-col space-y-2">
                    <label className={labelClassName}>
                        <span>{t('signup.doctor.cin')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <IdCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none" />
                        <input
                            type="text"
                            required
                            placeholder={t('signup.doctor.cinPlaceholder')}
                            value={formData.cinMedecin}
                            onChange={(e) => updateFormData("cinMedecin", e.target.value)}
                            className={`${inputClassName(errors.cinMedecin)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.cinMedecin} />
                </div>

                {/* Téléphone */}
                <div className="flex flex-col space-y-2">
                    <label className={labelClassName}>
                        <span>{t('signup.doctor.phone')} <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative">
                        <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none" />
                        <input
                            type="tel"
                            required
                            placeholder={t('signup.doctor.phonePlaceholder')}
                            value={formData.telMedecin}
                            onChange={(e) => updateFormData("telMedecin", e.target.value)}
                            className={`${inputClassName(errors.telMedecin)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.telMedecin} />
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                    <label className={labelClassName}>
                        <span>{t('signup.doctor.email')}<span className="text-red-500">*</span></span>
                        <span className="text-[hsl(var(--color-foreground))]/50 text-xs italic">({t('signup.doctor.optional')})</span>
                    </label>
                    <div className="relative">
                        <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 pointer-events-none" />
                        <input
                            type="email"
                            required
                            placeholder={t('signup.doctor.emailPlaceholder')}
                            value={formData.emailMedecin}
                            onChange={(e) => updateFormData("emailMedecin", e.target.value)}
                            className={`${inputClassName(errors.emailMedecin)} pl-10`}
                        />
                    </div>
                    <ErrorMessage errorKey={errors.emailMedecin} />
                </div>

                {/* --- Section Documents --- */}
                <div className="md:col-span-2 pt-4 border-t border-dashed border-[hsl(var(--color-border))]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-[hsl(var(--color-primary))]" />
                        Documents Justificatifs
                    </h3>

                    <div className="space-y-6">

                        {/* 1. Diplôme (OBLIGATOIRE) */}
                        <div className="flex flex-col space-y-2">
                            <label className={labelClassName}>
                                <span className="flex items-center gap-2">
                                    <FileBadge size={16} /> {t('signup.doctor.diploma')} <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="documentDiplome"
                                    type="file"
                                    required
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => updateFormData("documentDiplome", e.target.files[0])}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="documentDiplome"
                                    className={`
                                        flex items-center justify-center gap-2 w-full px-4 py-4 rounded-lg
                                        bg-[hsl(var(--color-background))]
                                        border-2 border-dashed 
                                        ${errors.documentDiplome ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-[hsl(var(--color-input))]'}
                                        text-[hsl(var(--color-foreground))]/70
                                        hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-background-alt))]
                                        hover:text-[hsl(var(--color-primary))]
                                        transition-all duration-200
                                        cursor-pointer
                                    `}
                                >
                                    <Upload size={20} />
                                    <span className="text-sm font-medium">
                                        {formData.documentDiplome ? formData.documentDiplome.name : t('signup.doctor.chooseFile')}
                                    </span>
                                </label>
                            </div>
                            {/* Message d'erreur spécifique pour le fichier */}
                            {errors.documentDiplome && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> {t('signup.doctor.errors.fileRequired')}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 2. Copie CIN (OPTIONNEL) */}
                            <div className="flex flex-col space-y-2">
                                <label className={labelClassName}>
                                    <span className="flex items-center gap-2">
                                        <IdCard size={16} /> {t('signup.doctor.cinCopy')}
                                    </span>
                                    <span className="text-[hsl(var(--color-foreground))]/50 text-xs">({t('signup.doctor.optional')})</span>
                                </label>
                                <input
                                    id="documentCinMedecin"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => updateFormData("documentCinMedecin", e.target.files[0])}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="documentCinMedecin"
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-[hsl(var(--color-input))] cursor-pointer hover:bg-[hsl(var(--color-background-alt))] transition-colors"
                                >
                                    <div className="bg-[hsl(var(--color-input))]/30 p-2 rounded-full">
                                        <Upload size={16} />
                                    </div>
                                    <span className="text-sm truncate flex-1">
                                        {formData.documentCinMedecin ? formData.documentCinMedecin.name : t('signup.doctor.chooseFile')}
                                    </span>
                                </label>
                            </div>

                            {/* 3. Licence (OPTIONNEL) */}
                            <div className="flex flex-col space-y-2">
                                <label className={labelClassName}>
                                    <span className="flex items-center gap-2">
                                        <FileText size={16} /> {t('signup.doctor.license')}
                                    </span>
                                    <span className="text-[hsl(var(--color-foreground))]/50 text-xs">({t('signup.doctor.optional')})</span>
                                </label>
                                <input
                                    id="documentLicence"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => updateFormData("documentLicence", e.target.files[0])}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="documentLicence"
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-[hsl(var(--color-input))] cursor-pointer hover:bg-[hsl(var(--color-background-alt))] transition-colors"
                                >
                                    <div className="bg-[hsl(var(--color-input))]/30 p-2 rounded-full">
                                        <Upload size={16} />
                                    </div>
                                    <span className="text-sm truncate flex-1">
                                        {formData.documentLicence ? formData.documentLicence.name : t('signup.doctor.chooseFile')}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <p className="text-xs text-[hsl(var(--color-foreground))]/60 flex items-center gap-1 justify-center">
                            <span>💡</span> {t('signup.doctor.fileHelp')}
                        </p>
                    </div>
                </div>

                {/* Login & Password (Credentials) */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[hsl(var(--color-border))]">
                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            <span>{t('signup.doctor.login')} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={t('signup.doctor.loginPlaceholder')}
                            value={formData.loginMedecin}
                            onChange={(e) => updateFormData("loginMedecin", e.target.value)}
                            className={inputClassName(errors.loginMedecin)}
                        />
                        <ErrorMessage errorKey={errors.loginMedecin} />
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className={labelClassName}>
                            <span>{t('signup.doctor.password')} <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="password"
                            required
                            placeholder={t('signup.doctor.passwordPlaceholder')}
                            value={formData.pwdMedecin}
                            onChange={(e) => updateFormData("pwdMedecin", e.target.value)}
                            className={inputClassName(errors.pwdMedecin)}
                        />
                        <ErrorMessage errorKey={errors.pwdMedecin} />
                    </div>
                </div>

            </div>
        </div>
    );
}