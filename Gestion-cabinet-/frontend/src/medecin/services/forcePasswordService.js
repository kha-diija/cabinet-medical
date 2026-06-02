// src/medecin/services/forcePasswordService.js
import { api } from './authService';

/**
 * ⚠️ SERVICE TEMPORAIRE - POUR DÉVELOPPEMENT UNIQUEMENT ⚠️
 * Permet de changer le mot de passe SANS vérifier l'ancien
 */
export const forcePasswordService = {
  /**
   * Change le mot de passe sans vérifier l'ancien (MODE URGENCE)
   * À utiliser UNIQUEMENT si vous avez oublié votre mot de passe
   */
  forceChangePassword: async (nouveauMotDePasse, confirmationMotDePasse) => {
    try {
      console.warn('⚠️ [ForcePasswordService] Changement FORCÉ de mot de passe');
      
      const response = await api.post('/medecin/parametres/force-change-password', {
        nouveauMotDePasse,
        confirmationMotDePasse
      });
      
      console.log('✅ [ForcePasswordService] Réponse reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ForcePasswordService] Erreur:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default forcePasswordService;