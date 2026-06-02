import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import apiService from '../../../services/apiService';
import './Parametres.css';

const Parametres = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Données du profil
    const [profileData, setProfileData] = useState({
        nom: '',
        prenom: '',
        login: '',
        numTel: ''
    });


    // Données du mot de passe
    const [passwordData, setPasswordData] = useState({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmationMotDePasse: ''
    });

    // Visibilité des mots de passe
    const [showPassword, setShowPassword] = useState({
        ancien: false,
        nouveau: false,
        confirmation: false
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const data = await apiService.parametres.getProfile();
            setProfileData({
                nom: data.nom || '',
                prenom: data.prenom || '',
                login: data.login || '',
                numTel: data.numTel || ''
            });
        } catch (err) {
            console.error('Erreur chargement profil:', err);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await apiService.parametres.updateProfile(profileData);
            setSuccess('Profil mis à jour avec succès !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (passwordData.nouveauMotDePasse.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (passwordData.nouveauMotDePasse !== passwordData.confirmationMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            await apiService.parametres.changePassword({
                ancienMotDePasse: passwordData.ancienMotDePasse,
                nouveauMotDePasse: passwordData.nouveauMotDePasse
            });

            setSuccess('Mot de passe changé avec succès !');
            setPasswordData({
                ancienMotDePasse: '',
                nouveauMotDePasse: '',
                confirmationMotDePasse: ''
            });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="parametres-container">
            <div className="parametres-header">
                <h1>⚙️ Paramètres</h1>
                <p>Gérez vos informations personnelles et votre sécurité</p>
            </div>

            <div className="parametres-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Profil
                </button>
                <button
                    className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    🔒 Sécurité
                </button>
            </div>

            <div className="parametres-content">
                {error && (
                    <div className="alert alert-error">
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        ✅ {success}
                    </div>
                )}

                {/* Onglet Profil */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <div className="card">
                            <h2>Informations personnelles</h2>
                            <p className="card-description">
                                Modifiez vos informations de profil
                            </p>

                            <form onSubmit={handleProfileSubmit} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nom">Nom *</label>
                                        <input
                                            type="text"
                                            id="nom"
                                            name="nom"
                                            value={profileData.nom}
                                            onChange={handleProfileChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="prenom">Prénom *</label>
                                        <input
                                            type="text"
                                            id="prenom"
                                            name="prenom"
                                            value={profileData.prenom}
                                            onChange={handleProfileChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="login">Identifiant</label>
                                    <input
                                        type="text"
                                        id="login"
                                        name="login"
                                        value={profileData.login}
                                        disabled
                                        className="input-disabled"
                                    />
                                    <small>L'identifiant ne peut pas être modifié</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="numTel">Numéro de téléphone</label>
                                    <input
                                        type="tel"
                                        id="numTel"
                                        name="numTel"
                                        value={profileData.numTel}
                                        onChange={handleProfileChange}
                                        placeholder="Ex: +212 6XX XXX XXX"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-info">
                                    <div className="info-item">
                                        <span className="info-label">Rôle:</span>
                                        <span className="info-value">{user?.role || 'SECRETAIRE'}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Onglet Sécurité */}
                {activeTab === 'password' && (
                    <div className="tab-content">
                        <div className="card">
                            <h2>Changer le mot de passe</h2>
                            <p className="card-description">
                                Assurez-vous d'utiliser un mot de passe fort et unique
                            </p>

                            <form onSubmit={handlePasswordSubmit} className="password-form">
                                <div className="form-group">
                                    <label htmlFor="ancienMotDePasse">Mot de passe actuel *</label>
                                    <input
                                        type="password"
                                        id="ancienMotDePasse"
                                        name="ancienMotDePasse"
                                        value={passwordData.ancienMotDePasse}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nouveauMotDePasse">Nouveau mot de passe *</label>
                                    <input
                                        type="password"
                                        id="nouveauMotDePasse"
                                        name="nouveauMotDePasse"
                                        value={passwordData.nouveauMotDePasse}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={loading}
                                        minLength="6"
                                        autoComplete="new-password"
                                    />
                                    <small>Minimum 6 caractères</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmationMotDePasse">Confirmer le nouveau mot de passe *</label>
                                    <input
                                        type="password"
                                        id="confirmationMotDePasse"
                                        name="confirmationMotDePasse"
                                        value={passwordData.confirmationMotDePasse}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={loading}
                                        minLength="6"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="security-tips">
                                    <h3>💡 Conseils de sécurité</h3>
                                    <ul>
                                        <li>Utilisez au moins 8 caractères</li>
                                        <li>Mélangez majuscules, minuscules et chiffres</li>
                                        <li>Évitez les informations personnelles</li>
                                        <li>Ne réutilisez pas vos anciens mots de passe</li>
                                    </ul>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Changement...' : '🔐 Changer le mot de passe'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Parametres;