// src/medecin/services/passwordService.js
import { api } from './authService';

export const passwordService = {
  /**
   * Change le mot de passe du médecin connecté
   */
  changePassword: async (ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse) => {
    try {
      console.log('🔐 [PasswordService] Envoi requête changement mot de passe');
      
      const response = await api.post('/medecin/parametres/change-password', {
        ancienMotDePasse,
        nouveauMotDePasse,
        confirmationMotDePasse
      });
      
      console.log('✅ [PasswordService] Réponse reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [PasswordService] Erreur:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Valide la force du mot de passe côté client
   */
  validatePasswordStrength: (password) => {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calcule le score de force du mot de passe (0-100)
   */
  calculatePasswordStrength: (password) => {
    if (!password) return 0;

    let strength = 0;

    // Longueur
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Complexité
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) strength += 15;

    return Math.min(strength, 100);
  },

  /**
   * Retourne le libellé et la couleur en fonction du score
   */
  getStrengthLabel: (strength) => {
    if (strength < 40) return { label: 'Faible', color: '#ef4444', className: 'weak' };
    if (strength < 70) return { label: 'Moyen', color: '#f59e0b', className: 'medium' };
    return { label: 'Fort', color: '#10b981', className: 'strong' };
  }
};

export default passwordService;