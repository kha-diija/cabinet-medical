import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    // Vérifier si le token existe
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage(t('resetPassword.errors.invalidToken'));
        }
    }, [token, t]);

    const validatePassword = () => {
        if (newPassword.length < 8) {
            setErrorMessage(t('resetPassword.errors.passwordTooShort'));
            return false;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage(t('resetPassword.errors.passwordMismatch'));
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validatePassword()) return;

        setStatus('loading');

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || t('resetPassword.errors.invalidToken'));
            }

            setStatus('success');

            // Redirection après 3 secondes
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            setStatus('error');
            setErrorMessage(error.message || t('resetPassword.errors.networkError'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-background))] p-4">
            <div className="max-w-md w-full glass rounded-2xl p-8 shadow-2xl border border-[hsl(var(--color-border))] animate-fade-in-up">

                {/* Header2 */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold gradient-text mb-2">
                        {t('resetPassword.title')}
                    </h2>
                    <p className="text-[hsl(var(--color-foreground))]/60 text-sm">
                        {t('resetPassword.subtitle')}
                    </p>
                </div>

                {/* Message de succès */}
                {status === 'success' ? (
                    <div className="text-center animate-fade-in-up space-y-6">
                        <div className="glass-hover p-6 rounded-xl border border-green-500/30 bg-green-500/10">
                            <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
                            <p className="text-green-600 font-medium mb-2">
                                {t('resetPassword.success.title')}
                            </p>
                            <p className="text-[hsl(var(--color-foreground))]/70 text-sm">
                                {t('resetPassword.success.message')}
                            </p>
                        </div>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            {t('resetPassword.backToLogin')}
                        </Link>
                    </div>
                ) : (
                    /* Formulaire */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nouveau mot de passe */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--color-foreground))] ml-1">
                                {t('resetPassword.fields.newPassword')}
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground))]/40"
                                    size={18}
                                />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-card-foreground))] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-[hsl(var(--color-foreground))]/40"
                                    placeholder={t('resetPassword.fields.newPasswordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 hover:text-[hsl(var(--color-foreground))] transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmer mot de passe */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[hsl(var(--color-foreground))] ml-1">
                                {t('resetPassword.fields.confirmPassword')}
                            </label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground))]/40"
                                    size={18}
                                />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-card-foreground))] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-[hsl(var(--color-foreground))]/40"
                                    placeholder={t('resetPassword.fields.confirmPasswordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground))]/40 hover:text-[hsl(var(--color-foreground))] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Message d'erreur */}
                        {errorMessage && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {errorMessage}
                            </div>
                        )}

                        {/* Bouton Submit */}
                        <button
                            type="submit"
                            disabled={status === 'loading' || !token}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t('resetPassword.submitting')}
                                </>
                            ) : (
                                t('resetPassword.submitBtn')
                            )}
                        </button>
                    </form>
                )}

                {/* Retour à la connexion */}
                {status !== 'success' && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-[hsl(var(--color-foreground))]/60 hover:text-blue-500 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            {t('resetPassword.backToLogin')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}