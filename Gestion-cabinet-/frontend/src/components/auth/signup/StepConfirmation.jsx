import { useState } from 'react';
import { X, CheckCircle, ScrollText, AlertCircle, FileCheck, FileX, PenTool, User, Building, FileText } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { useTranslation } from '../../../i18n';

export default function StepConfirmation({ formData, updateFormData, errors }) {
    const { t } = useTranslation();
    const [showTerms, setShowTerms] = useState(false);

    // Fonction pour afficher l'état des fichiers avec style
    const renderFile = (file) => (
        file ? (
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <FileCheck size={16} /> {file.name}
            </span>
        ) : (
            <span className="flex items-center gap-2 text-red-500/70 font-medium">
                <FileX size={16} /> {t('signup.confirmation.notProvided')}
            </span>
        )
    );

    // Composant pour afficher l'erreur
    const ErrorMessage = ({ errorKey }) => {
        if (!errorKey) return null;
        return (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-2 animate-pulse">
                <AlertCircle size={12} />
                {t(`signup.confirmation.errors.${errorKey}`) || errorKey}
            </p>
        );
    };

    // Classes utilitaires
    const cardClass = "p-5 rounded-xl bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] shadow-sm hover:shadow-md transition-shadow duration-200";
    const sectionTitleClass = "text-lg font-bold mb-4 flex items-center gap-2 text-[hsl(var(--color-primary))] border-b border-[hsl(var(--color-border))] pb-2";
    const listClass = "space-y-3 text-sm text-[hsl(var(--color-foreground))]";
    const labelClass = "font-semibold text-[hsl(var(--color-foreground))]/70";

    return (
        <div className="space-y-6 p-1">

            {/* Header2 */}
            <div className="border-b border-[hsl(var(--color-border))] pb-3 space-y-2">
                <h2 className="text-2xl font-extrabold gradient-text flex items-center gap-2">
                    ✅ {t('signup.confirmation.title')}
                </h2>
                <p className="text-[hsl(var(--color-foreground))]/60 text-sm">
                    {t('signup.confirmation.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Bloc Informations Médecin */}
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>
                        <User size={20} /> {t('signup.confirmation.doctorInfo')}
                    </h3>
                    <ul className={listClass}>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.name')}:</span>
                            <span>{formData.nomMedecin} {formData.prenomMedecin}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.cin')}:</span>
                            <span>{formData.cinMedecin}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.phone')}:</span>
                            <span>{formData.telMedecin}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.email')}:</span>
                            <span className="truncate max-w-[150px]">{formData.emailMedecin || '-'}</span>
                        </li>
                    </ul>
                </div>

                {/* Bloc Informations Cabinet */}
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>
                        <Building size={20} /> {t('signup.confirmation.cabinetInfo')}
                    </h3>
                    <ul className={listClass}>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.cabinetName')}:</span>
                            <span>{formData.nomCabinet}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className={labelClass}>{t('signup.confirmation.labels.specialty')}:</span>
                            <span>{t(`signup.cabinet.specialties.${formData.specialite}`) || formData.specialite}</span>
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className={labelClass}>{t('signup.confirmation.labels.address')}:</span>
                            <span className="text-xs bg-[hsl(var(--color-background))] p-2 rounded border border-[hsl(var(--color-border))]">
                                {formData.adresseCabinet}
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Bloc Documents */}
                <div className={`${cardClass} md:col-span-2`}>
                    <h3 className={sectionTitleClass}>
                        <FileText size={20} /> {t('signup.confirmation.documents')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[hsl(var(--color-background))] p-3 rounded-lg border border-[hsl(var(--color-border))]">
                            <span className="block text-xs font-semibold mb-1 opacity-70">{t('signup.confirmation.labels.diploma')}</span>
                            {renderFile(formData.documentDiplome)}
                        </div>
                        <div className="bg-[hsl(var(--color-background))] p-3 rounded-lg border border-[hsl(var(--color-border))]">
                            <span className="block text-xs font-semibold mb-1 opacity-70">{t('signup.confirmation.labels.copyCin')}</span>
                            {renderFile(formData.documentCinMedecin)}
                        </div>
                        <div className="bg-[hsl(var(--color-background))] p-3 rounded-lg border border-[hsl(var(--color-border))]">
                            <span className="block text-xs font-semibold mb-1 opacity-70">{t('signup.confirmation.labels.license')}</span>
                            {renderFile(formData.documentLicence)}
                        </div>
                    </div>
                </div>

                {/* Bloc Secrétaire (Conditionnel) */}
                {formData.includeSecretaire && (
                    <div className={`${cardClass} md:col-span-2`}>
                        <h3 className={sectionTitleClass}>
                            👩‍💼 {t('signup.confirmation.secretaryInfo')}
                        </h3>
                        <ul className={listClass}>
                            <li><strong>{t('signup.confirmation.labels.name')} :</strong> {formData.nomSecretaire} {formData.prenomSecretaire}</li>
                            <li><strong>{t('signup.confirmation.labels.login')} :</strong> {formData.loginSecretaire}</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* --- Zone de Signature (OBLIGATOIRE) --- */}
            <div className={`
                p-5 rounded-xl border-2 transition-all duration-300
                ${errors.signatureMedecin
                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]'}
            `}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-[hsl(var(--color-foreground))]">
                    <PenTool size={20} className={errors.signatureMedecin ? 'text-red-500' : 'text-[hsl(var(--color-primary))]'} />
                    {t('signup.confirmation.signature')} <span className="text-red-500">*</span>
                </h3>

                <p className="text-sm mb-4 text-[hsl(var(--color-foreground))]/60">
                    {t('signup.confirmation.signatureHelp')}
                </p>

                <div className={`
                    rounded-lg overflow-hidden border
                    ${errors.signatureMedecin ? 'border-red-300 shadow-sm shadow-red-200' : 'border-[hsl(var(--color-border))]'}
                `}>
                    <SignaturePad
                        onSign={(dataURL) => {
                            updateFormData("signatureMedecin", dataURL);
                            // On peut aussi clear l'erreur ici si nécessaire via une fonction props
                        }}
                        signatureData={formData.signatureMedecin}
                    />
                </div>

                <ErrorMessage errorKey={errors.signatureMedecin} />
            </div>

            {/* Acceptation des termes */}
            <div className={`
                flex flex-col space-y-3 pt-6 border-t border-[hsl(var(--color-border))]
                ${errors.acceptTerms ? 'p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200' : ''}
            `}>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => updateFormData("acceptTerms", e.target.checked)}
                        className={`
                            mt-1 h-5 w-5 rounded border-2 cursor-pointer
                            ${errors.acceptTerms ? 'border-red-500 text-red-600 focus:ring-red-500' : 'border-[hsl(var(--color-border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]'}
                        `}
                    />
                    <div className="flex flex-col">
                        <label
                            htmlFor="acceptTerms"
                            className="text-base cursor-pointer flex items-center flex-wrap gap-1 text-[hsl(var(--color-foreground))]"
                        >
                            {t('signup.confirmation.acceptTerms')} <span className="text-red-500">*</span>
                        </label>
                        <button
                            onClick={() => setShowTerms(true)}
                            type="button"
                            className="flex items-center text-sm font-semibold text-[hsl(var(--color-primary))] hover:underline mt-1 w-fit"
                        >
                            <ScrollText size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('signup.confirmation.readTerms')}
                        </button>
                    </div>
                </div>
                <ErrorMessage errorKey={errors.acceptTerms} />
            </div>

            {/* Modal CGU (Reste inchangée visuellement, juste nettoyage du code) */}
            {showTerms && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))]">
                        <div className="p-5 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-muted))]/30">
                            <h3 className="text-xl font-bold text-[hsl(var(--color-card-foreground))]">
                                {t('signup.confirmation.termsTitle')}
                            </h3>
                            <button
                                onClick={() => setShowTerms(false)}
                                className="p-2 rounded-full hover:bg-[hsl(var(--color-muted))] transition-colors text-[hsl(var(--color-foreground))]"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow prose prose-sm dark:prose-invert max-w-none text-[hsl(var(--color-card-foreground))]">
                            <div dangerouslySetInnerHTML={{ __html: t('signup.confirmation.termsContent') }} />
                        </div>
                        <div className="p-5 border-t border-[hsl(var(--color-border))] flex justify-end bg-[hsl(var(--color-muted))]/30 rounded-b-xl">
                            <button
                                onClick={() => {
                                    updateFormData("acceptTerms", true);
                                    setShowTerms(false);
                                }}
                                className="flex items-center px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 bg-[image:var(--gradient-primary)] text-white font-medium"
                            >
                                <CheckCircle size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />
                                {t('signup.confirmation.acceptAndClose')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}