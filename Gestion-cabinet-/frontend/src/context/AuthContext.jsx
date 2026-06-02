import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifier si l'utilisateur est déjà connecté au chargement
    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');

                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    console.log('✅ Utilisateur restauré depuis localStorage:', parsedUser);
                }
            } catch (error) {
                console.error('❌ Erreur lors de la restauration de la session:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Fonction de connexion - VERSION SYNCHRONE
    const login = (userData) => {
        try {
            console.log('🔐 AuthContext - Mise à jour avec:', userData);

            if (!userData || !userData.token) {
                throw new Error('Données utilisateur invalides');
            }

            const userToSave = {
                userId: userData.userId,
                login: userData.login,
                nom: userData.nom,
                prenom: userData.prenom,
                role: userData.role,
                cabinetId: userData.cabinetId,
                cabinetName: userData.cabinetName
            };

            console.log('💾 Sauvegarde dans localStorage:', userToSave);

            // Sauvegarder dans localStorage
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userToSave));

            // ✅ MISE À JOUR SYNCHRONE de l'état
            console.log('🔄 Mise à jour SYNCHRONE de l\'état user...');
            setUser(userToSave);

            console.log('✅ AuthContext - Contexte mis à jour avec succès');
            console.log('✅ État user après setUser:', userToSave);

            return userToSave;
        } catch (error) {
            console.error('❌ AuthContext - Erreur lors de la connexion:', error);
            throw error;
        }
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        console.log('🚪 Utilisateur déconnecté');
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};