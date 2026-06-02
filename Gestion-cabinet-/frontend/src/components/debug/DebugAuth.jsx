import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Composant de debug à ajouter temporairement dans App.jsx
 * pour voir l'état de l'authentification
 */
const DebugAuth = () => {
    const { user, loading } = useAuth();

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 9999,
            fontFamily: 'monospace'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                🐛 Debug Auth
            </div>
            <div>
                <strong>Loading:</strong> {loading ? '✅ Oui' : '❌ Non'}
            </div>
            <div>
                <strong>User:</strong> {user ? '✅ Connecté' : '❌ Non connecté'}
            </div>
            {user && (
                <>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Login:</strong> {user.login}</div>
                    <div><strong>Nom:</strong> {user.nom} {user.prenom}</div>
                    <div><strong>Cabinet:</strong> {user.cabinetName}</div>
                </>
            )}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #666' }}>
                <strong>LocalStorage:</strong>
                <div>Token: {localStorage.getItem('token') ? '✅' : '❌'}</div>
                <div>User: {localStorage.getItem('user') ? '✅' : '❌'}</div>
            </div>
        </div>
    );
};

export default DebugAuth;