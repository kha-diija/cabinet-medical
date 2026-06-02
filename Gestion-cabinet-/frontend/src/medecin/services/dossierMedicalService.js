// dossierMedicalService.js
import { api } from './authService';

const API_BASE_URL = '/medecin/dossiers-medicaux';

const dossierMedicalService = {
  /**
   * Récupérer le dossier médical du patient EN_COURS
   */
  async getCurrentPatientDossierMedical() {
    try {
      console.log('📤 GET Dossier médical patient en cours');
      
      const response = await api.get(`${API_BASE_URL}/current`);
      console.log('✅ Dossier médical reçu:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération dossier:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      
      // Si 404, c'est qu'il n'y a pas de patient en cours
      if (error.response?.status === 404) {
        return null;
      }
      
      throw error;
    }
  },

  /**
   * Créer un nouveau dossier médical pour le patient EN_COURS
   */
  async createDossierMedical(dossierData) {
    try {
      console.log('📤 POST Création dossier médical');
      console.log('📤 Data:', dossierData);
      
      const response = await api.post(API_BASE_URL, dossierData);
      
      console.log('✅ Dossier médical créé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création dossier:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        throw new Error('Aucun patient en cours. Veuillez démarrer une consultation depuis le dashboard.');
      } else if (error.response?.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      } else if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      } else {
        throw new Error('Erreur lors de la création du dossier médical');
      }
    }
  },

  /**
   * Mettre à jour le dossier médical du patient EN_COURS
   */
  async updateDossierMedical(dossierData) {
    try {
      console.log('📤 PUT Mise à jour dossier médical');
      console.log('📤 Data:', dossierData);
      
      const response = await api.put(API_BASE_URL, dossierData);
      
      console.log('✅ Dossier médical mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour dossier:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Récupérer le dossier médical d'un patient spécifique
   */
  async getDossierMedicalByPatientId(patientId) {
    try {
      console.log('📤 GET Dossier médical patient:', patientId);
      
      const response = await api.get(`${API_BASE_URL}/patient/${patientId}`);
      console.log('✅ Dossier médical reçu:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération dossier:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Sauvegarder temporairement les données du formulaire (brouillon en mémoire)
   */
  saveDraft(formData) {
    try {
      this._draft = { ...formData, savedAt: new Date().toISOString() };
      console.log('💾 Brouillon dossier sauvegardé:', this._draft);
    } catch (error) {
      console.error('❌ Erreur sauvegarde brouillon:', error);
    }
  },

  /**
   * Récupérer le brouillon sauvegardé
   */
  getDraft() {
    try {
      if (this._draft) {
        console.log('📄 Brouillon dossier récupéré:', this._draft);
        return this._draft;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération brouillon:', error);
      return null;
    }
  },

  /**
   * Supprimer le brouillon
   */
  clearDraft() {
    try {
      this._draft = null;
      console.log('🗑️ Brouillon dossier supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression brouillon:', error);
    }
  },

  // Variable privée pour stocker le brouillon en mémoire
  _draft: null
};

export default dossierMedicalService;