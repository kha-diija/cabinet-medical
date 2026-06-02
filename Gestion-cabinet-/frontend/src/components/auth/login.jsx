/**
 * COMPOSANT LOGIN MODAL avec API Backend
 * Modale de connexion avec 3 rôles (ADMINISTRATEUR/MEDECIN/SECRETAIRE)
 * Backend: Spring Boot + JWT
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';

export default function LoginModal({ onClose, onLoginSuccess }) {
    const { t } = useTranslation();

    const [selectedRole, setSelectedRole] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCabinet, setSelectedCabinet] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);
    const [cabinets, setCabinets] = useState([]);

    // Rôles backend
    const roles = [
        {
            id: 'ADMINISTRATEUR',
            label: t('login.roles.admin.label'),
            emoji: '🔐',
            description: t('login.roles.admin.description')
        },
        {
            id: 'MEDECIN',
            label: t('login.roles.doctor.label'),
            emoji: '👨‍⚕️',
            description: t('login.roles.doctor.description')
        },
        {
            id: 'SECRETAIRE',
            label: t('login.roles.secretary.label'),
            emoji: '👩‍💼',
            description: t('login.roles.secretary.description')
        },
    ];

    // Fermer modal au clic en dehors
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Charger les cabinets depuis le backend
    useEffect(() => {
        const fetchCabinets = async () => {
            try {
                const res = await axios.get(`${API_URL}/cabinets`);
                setCabinets(res.data);
            } catch (error) {
                console.error("Erreur lors du chargement des cabinets :", error);
            }
        };

        fetchCabinets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!login || !password) {
            setError(t('login.errors.fillAll'));
            return;
        }

        if (selectedRole !== 'ADMINISTRATEUR' && !selectedCabinet) {
            setError(t('login.errors.selectCabinet'));
            return;
        }

        setIsLoading(true);

        try {
            // Préparer la requête selon le format backend
            const requestData = {
                login: login,
                password: password,
                role: selectedRole,
                cabinetId: selectedRole !== 'ADMINISTRATEUR' ? parseInt(selectedCabinet) : null
            };

            console.log('🔐 Tentative de connexion:', requestData);

            // Appel API
            const response = await axios.post(`${API_URL}/auth/login`, requestData);

            console.log('✅ Connexion réussie:', response.data);

            // Sauvegarder dans localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                userId: response.data.userId,
                login: response.data.login,
                nom: response.data.nom,
                prenom: response.data.prenom,
                role: response.data.role,
                cabinetId: response.data.cabinetId,
                cabinetName: response.data.cabinetName
            }));

            // ✅ Appeler onLoginSuccess si défini
            console.log('📞 Appel de onLoginSuccess avec:', response.data);

            if (onLoginSuccess) {
                onLoginSuccess(response.data);
            } else {
                // ⚠️ FALLBACK : Si onLoginSuccess n'est pas défini, rediriger directement
                console.warn('⚠️ onLoginSuccess n\'est pas défini, redirection directe...');

                const roleRoutes = {
                    'SECRETAIRE': '/secretaire',
                    'MEDECIN': '/medecin',
                    'ADMINISTRATEUR': '/administrateur'
                };

                const redirectPath = roleRoutes[response.data.role] || '/';
                console.log('🔀 Redirection de secours vers:', redirectPath);

                window.location.href = redirectPath;
            }

        } catch (err) {
            console.error('❌ Erreur de connexion:', err);

            // Gérer les différents types d'erreurs
            if (err.response) {
                setError(err.response.data.message || t('login.errors.connectionFailed'));
            } else if (err.request) {
                setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
            } else {
                setError(t('login.errors.connectionFailed'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in-up">
            <div
                ref={modalRef}
                className="glass relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl border border-[hsl(var(--color-border))]"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
                        {t('login.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-primary))] transition-all text-2xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                {!selectedRole ? (
                    // Sélection rôle
                    <div>
                        <p className="text-[hsl(var(--color-foreground))] mb-4 font-medium">
                            {t('login.selectRole')}
                        </p>
                        <div className="grid gap-4">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className="glass-hover p-4 rounded-xl border border-[hsl(var(--color-border))] text-left transition-all"
                                >
                                    <div className="text-3xl mb-2">{role.emoji}</div>
                                    <p className="font-semibold text-[hsl(var(--color-card-foreground))]">
                                        {role.label}
                                    </p>
                                    <p className="text-sm text-[hsl(var(--color-foreground))]">
                                        {role.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Formulaire login
                    <div>
                        <button
                            onClick={() => {
                                setSelectedRole(null);
                                setLogin('');
                                setPassword('');
                                setSelectedCabinet('');
                                setError('');
                            }}
                            className="mb-4 text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-foreground))] text-sm font-medium"
                        >
                            ← {t('login.changeRole')}
                        </button>

                        <p className="text-sm text-[hsl(var(--color-foreground))] mb-6 font-medium">
                            {t('login.connectedAs')}{' '}
                            <span className="font-bold text-[hsl(var(--color-card-foreground))]">
                {roles.find((r) => r.id === selectedRole)?.label}
              </span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Login */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                                    {t('login.fields.email')}
                                </label>
                                <input
                                    type="text"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    placeholder="Votre identifiant"
                                    className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] bg-[hsl(var(--color-card))] text-[hsl(var(--color-card-foreground))]"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                                    {t('login.fields.password')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('login.fields.passwordPlaceholder')}
                                        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] bg-[hsl(var(--color-card))] text-[hsl(var(--color-card-foreground))]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-foreground))]"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            {/* Cabinet */}
                            {selectedRole !== 'ADMINISTRATEUR' && (
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--color-foreground))] mb-2">
                                        {t('login.fields.cabinet')}
                                    </label>
                                    <select
                                        value={selectedCabinet}
                                        onChange={(e) => setSelectedCabinet(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--color-input))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] bg-[hsl(var(--color-card))] text-[hsl(var(--color-card-foreground))] cursor-pointer"
                                    >
                                        <option value="">{t('login.fields.cabinetPlaceholder')}</option>
                                        {Array.isArray(cabinets) && cabinets.map((cabinet) => (
                                            <option key={cabinet.id} value={cabinet.id}>
                                                {cabinet.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Erreur */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Mot de passe oublié */}
                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    onClick={onClose}
                                    className="text-sm text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-foreground))] font-medium transition-colors"
                                >
                                    {t('login.forgotPassword')}
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? t('login.submitting') : t('login.submitBtn')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}