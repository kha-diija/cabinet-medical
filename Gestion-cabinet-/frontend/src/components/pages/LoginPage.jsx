import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../auth/login';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);

    console.log('🎨 LoginPage - Rendu avec user:', user);

    // Si l'utilisateur est déjà connecté, rediriger immédiatement
    useEffect(() => {
        console.log('👀 LoginPage useEffect - user:', user);
        if (user) {
            console.log('👤 useEffect - Utilisateur détecté:', user);
            const roleRoutes = {
                'SECRETAIRE': '/secretaire',
                'MEDECIN': '/medecin',
                'ADMINISTRATEUR': '/administrateur'
            };

            const redirectPath = roleRoutes[user.role] || '/';
            console.log('🔀 useEffect - Redirection vers:', redirectPath);
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

    const handleLoginSuccess = (userData) => {
        console.log('🎯 ===== DEBUT handleLoginSuccess =====');
        console.log('✅ LoginPage - handleLoginSuccess appelé !');
        console.log('📦 Données reçues:', userData);

        try {
            // Définir les routes
            const roleRoutes = {
                'SECRETAIRE': '/secretaire',
                'MEDECIN': '/medecin',
                'ADMINISTRATEUR': '/administrateur'
            };

            const redirectPath = roleRoutes[userData.role] || '/';
            console.log('🎯 Route calculée:', redirectPath);

            // Mettre à jour le contexte
            console.log('🔄 Appel de login() du contexte...');
            const savedUser = login(userData);
            console.log('✅ Contexte mis à jour, user:', savedUser);

            // Fermer le modal
            console.log('🚪 Fermeture du modal...');
            setShowModal(false);

            // Sauvegarder manuellement dans localStorage (double sécurité)
            console.log('💾 Sauvegarde manuelle dans localStorage...');
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify({
                userId: userData.userId,
                login: userData.login,
                nom: userData.nom,
                prenom: userData.prenom,
                role: userData.role,
                cabinetId: userData.cabinetId,
                cabinetName: userData.cabinetName
            }));

            console.log('🔀 Redirection FORCÉE vers:', redirectPath);

            // ✅ REDIRECTION FORCÉE
            window.location.href = redirectPath;

            console.log('🎯 ===== FIN handleLoginSuccess =====');

        } catch (error) {
            console.error('❌ ERREUR dans handleLoginSuccess:', error);
            alert('Erreur lors de la connexion. Veuillez réessayer.');
        }
    };

    const handleClose = () => {
        console.log('❌ Fermeture du modal');
        setShowModal(false);
        navigate('/');
    };

    console.log('🎨 LoginPage - Rendu du modal, showModal:', showModal);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
            {showModal && (
                <LoginModal
                    onClose={handleClose}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </div>
    );
};

export default LoginPage;