import { useState } from 'react';
import { User, Building2, Users, CheckCircle, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useTranslation } from '../i18n';
import { createClient } from '@supabase/supabase-js';

// Imports des composants
import StepMedecin from '../components/auth/signup/StepMedecin';
import StepCabinet from '../components/auth/signup/StepCabinet';
import StepSecretaire from '../components/auth/signup/StepSecretaire';
import StepConfirmation from '../components/auth/signup/StepConfirmation';

// 🔥 Configuration Supabase
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY; // ⚠️ Remplacez par votre clé publique
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Form() {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        nomMedecin: '', prenomMedecin: '', cinMedecin: '', telMedecin: '', emailMedecin: '', loginMedecin: '', pwdMedecin: '', signatureMedecin: '',
        nomCabinet: '', specialite: '', telCabinet: '', adresseCabinet: '', emailCabinet: '', logoCabinet: null,
        includeSecretaire: false, nomSecretaire: '', prenomSecretaire: '', cinSecretaire: '', telSecretaire: '', emailSecretaire: '', loginSecretaire: '', pwdSecretaire: '',
        acceptTerms: false, documentDiplome: null, documentCinMedecin: null, documentLicence: null
    });
    const [errors, setErrors] = useState({});

    const steps = [
        { id: 'cabinet', label: t("signup.steps.cabinet"), icon: Building2, component: StepCabinet },
        { id: 'medecin', label: t("signup.steps.medecin"), icon: User, component: StepMedecin },
        { id: 'secretaire', label: t("signup.steps.secretaire"), icon: Users, component: StepSecretaire },
        { id: 'confirmation', label: t("signup.steps.confirmation"), icon: CheckCircle, component: StepConfirmation }
    ];

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    // Dans Form.js

    const validateCurrentStep = () => {
        const stepId = steps[currentStep].id;
        const newErrors = {};

        // Validation Cabinet
        if (stepId === 'cabinet') {
            // 👇 On met juste 'required', le composant StepCabinet s'occupera de la traduction
            if (!formData.nomCabinet) newErrors.nomCabinet = 'required';
            if (!formData.specialite) newErrors.specialite = 'required';
            if (!formData.telCabinet) newErrors.telCabinet = 'required';
            if (!formData.adresseCabinet) newErrors.adresseCabinet = 'required';
            if (!formData.emailCabinet) newErrors.emailCabinet = 'required';
        }

        // Validation Médecin
        if (stepId === 'medecin') {
            if (!formData.nomMedecin) newErrors.nomMedecin = 'required';
            if (!formData.prenomMedecin) newErrors.prenomMedecin = 'required';
            if (!formData.cinMedecin) newErrors.cinMedecin = 'required';
            if (!formData.telMedecin) newErrors.telMedecin = 'required';
            if (!formData.loginMedecin) newErrors.loginMedecin = 'required';
            if (!formData.pwdMedecin) newErrors.pwdMedecin = 'required';
            if (!formData.documentDiplome) newErrors.documentDiplome = 'fileRequired';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        // On valide d'abord l'étape actuelle
        if (validateCurrentStep()) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
                window.scrollTo(0, 0);
            }
        } else {
            // Utilisation de la traduction
            alert(t('signup.errors.validationFailed'));
            // ou console.log(t('signup.errors.validationFailed'));
        }
    };    const prevStep = () => currentStep > 0 && setCurrentStep(prev => prev - 1);
    const goHome = () => (window.location.href = '/');

    /**
     * 🔥 Upload un fichier vers Supabase Storage
     */
    /**
     * 🔥 Upload un fichier vers Supabase Storage (Bucket Privé)
     */
    const uploadToSupabase = async (file, folder) => {
        if (!file) return null;

        // Nettoyage du nom de fichier pour éviter les caractères spéciaux
        const fileExt = file.name.split('.').pop();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}-${cleanFileName}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // 1. Upload du fichier
        const { data, error } = await supabase.storage
            .from('cabinet-documents-private')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Erreur upload Supabase:", error);
            throw error;
        }

        // ⚠️ IMPORTANT : Pour un bucket PRIVE, on stocke le CHEMIN (path), pas l'URL.
        // L'URL publique ne marcherait pas.
        return data.path;
    };

    /**
     * 🔥 Convertir Data URL (signature) en File puis uploader
     */
    const uploadSignature = async (dataURL) => {
        if (!dataURL) return null;

        try {
            // Convertir Data URL en Blob
            const response = await fetch(dataURL);
            const blob = await response.blob();
            const file = new File([blob], 'signature.png', { type: 'image/png' });

            // Upload vers Supabase
            return await uploadToSupabase(file, 'signatures');
        } catch (error) {
            console.error('Erreur upload signature:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setUploading(true);

            // 🔥 1. UPLOADER TOUS LES FICHIERS VERS SUPABASE
            console.log('📤 Upload des fichiers vers Supabase...');

            const [logoCabinetUrl, documentDiplomeUrl, documentCinUrl, documentLicenceUrl, signatureUrl] = await Promise.all([
                uploadToSupabase(formData.logoCabinet, 'logos'),
                uploadToSupabase(formData.documentDiplome, 'diplomes'),
                uploadToSupabase(formData.documentCinMedecin, 'cin'),
                uploadToSupabase(formData.documentLicence, 'licences'),
                uploadSignature(formData.signatureMedecin)
            ]);

            console.log('✅ Tous les fichiers uploadés');

            // 🔥 2. ENVOYER LES DONNÉES AU BACKEND (SEULEMENT LES URLs)
            const payload = {
                // Cabinet
                nomCabinet: formData.nomCabinet,
                specialite: formData.specialite,
                adresseCabinet: formData.adresseCabinet,
                telCabinet: formData.telCabinet,
                emailCabinet: formData.emailCabinet,
                logoCabinet: logoCabinetUrl,

                // Médecin
                nomMedecin: formData.nomMedecin,
                prenomMedecin: formData.prenomMedecin,
                cinMedecin: formData.cinMedecin,
                telMedecin: formData.telMedecin,
                emailMedecin: formData.emailMedecin,
                loginMedecin: formData.loginMedecin,
                pwdMedecin: formData.pwdMedecin,
                signatureMedecin: signatureUrl,

                // Secrétaire
                includeSecretaire: formData.includeSecretaire,
                nomSecretaire: formData.nomSecretaire || null,
                prenomSecretaire: formData.prenomSecretaire || null,
                cinSecretaire: formData.cinSecretaire || null,
                telSecretaire: formData.telSecretaire || null,
                emailSecretaire: formData.emailSecretaire || null,
                loginSecretaire: formData.loginSecretaire || null,
                pwdSecretaire: formData.pwdSecretaire || null,

                // Documents (URLs)
                documentDiplome: documentDiplomeUrl,
                documentCinMedecin: documentCinUrl,
                documentLicence: documentLicenceUrl,

                acceptTerms: formData.acceptTerms
            };

            console.log('📤 Envoi des données au backend:', payload);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/inscription/demande`, {                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur serveur:', errorText);
                throw new Error(`Erreur ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                alert('✅ ' + data.message + '\n' + t("signup.alert.success"));
                window.location.href = '/';
            } else {
                alert('❌ ' + t("signup.alert.error") + ': ' + data.message);
            }

        } catch (error) {
            console.error('Erreur complète:', error);
            alert('❌ ' + t("signup.alert.error") + ': ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const CurrentComponent = steps[currentStep].component;

    return (
        <div className="min-h-screen bg-[hsl(var(--color-background))] p-4 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">

                {/* Header2 */}
                <div className="text-center mb-8 relative">
                    <button
                        onClick={goHome}
                        className="absolute left-0 top-0 glass-hover px-4 py-2 rounded-lg flex items-center gap-2 text-[hsl(var(--color-foreground))] font-medium"
                    >
                        <Home size={20} /> {t("signup.home")}
                    </button>

                    <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-2 flex items-center justify-center gap-3">
                        🚀 {t("signup.title")}
                    </h1>

                    <p className="text-[hsl(var(--color-foreground))]/60">
                        {t("signup.subtitle")}
                    </p>
                </div>

                {/* Stepper */}
                <div className="mb-8 glass rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        index === currentStep
                                            ? 'bg-[image:var(--gradient-primary)] text-[hsl(var(--color-primary-foreground))] scale-110 shadow-lg'
                                            : index < currentStep
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-[hsl(var(--color-input))] text-[hsl(var(--color-foreground))]/40'
                                    }`}>
                                        {index < currentStep ? <CheckCircle size={24} /> : <step.icon size={24} />}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium hidden md:block ${
                                        index === currentStep
                                            ? 'text-[hsl(var(--color-primary))]'
                                            : 'text-[hsl(var(--color-foreground))]/50'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                                        index < currentStep ? 'bg-emerald-500' : 'bg-[hsl(var(--color-input))]'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="glass rounded-2xl p-8 mb-6">
                    <CurrentComponent formData={formData} updateFormData={updateFormData} errors={errors} />
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                            currentStep === 0
                                ? 'bg-[hsl(var(--color-input))] text-[hsl(var(--color-foreground))]/30 cursor-not-allowed'
                                : 'glass-hover text-[hsl(var(--color-foreground))]'
                        }`}
                    >
                        <ChevronLeft size={20} /> {t("signup.previous")}
                    </button>

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={nextStep}
                            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 bg-[image:var(--gradient-primary)] text-[hsl(var(--color-primary-foreground))] hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                            {t("signup.next")} <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.acceptTerms || uploading}
                            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                                formData.acceptTerms && !uploading
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg transform hover:scale-105'
                                    : 'bg-[hsl(var(--color-input))] text-[hsl(var(--color-foreground))]/30 cursor-not-allowed'
                            }`}
                        >
                            {uploading ? '⏳ Upload en cours...' : t("signup.submit")} <CheckCircle size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}