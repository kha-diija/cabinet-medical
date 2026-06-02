// ✅ IMPORTER api depuis authService au lieu d'axios
import { api } from './authService';

const API_BASE_URL = '/medecin/consultations';

const consultationService = {
  /**
   * Récupérer l'historique des consultations d'un patient spécifique
   */
  async getPatientConsultationHistory(patientId) {
    try {
      if (!patientId) {
        console.error('❌ PatientId manquant');
        return [];
      }
      
      const url = `${API_BASE_URL}/${patientId}`;
      console.log('📤 GET Historique:', url);
      
      // ✅ Utiliser api au lieu d'axios
      const response = await api.get(url);
      console.log('✅ Historique reçu:', response.data);
       console.log('🔍 [DEBUG] Avant requête:', {
      token: localStorage.getItem('token') ? 'PRESENT' : 'ABSENT',
      headers: api.defaults.headers.common
    });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur historique:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Créer une nouvelle consultation pour le patient EN_COURS
   * Le backend trouve automatiquement le patient via le RDV EN_COURS
   */
  async createConsultation(consultationData) {
    try {
      console.log('📤 POST Création consultation');
      console.log('📤 URL:', API_BASE_URL);
      console.log('📤 Data:', consultationData);
      
      // ✅ Utiliser api au lieu d'axios
      const response = await api.post(API_BASE_URL, consultationData);
      
      console.log('✅ Consultation créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création consultation:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers
      });
      
      // Remonter un message d'erreur plus clair
      if (error.response?.status === 404) {
        throw new Error('Endpoint de consultation non trouvé. Vérifiez que le backend est démarré.');
      } else if (error.response?.status === 401) {
        throw new Error('Non authentifié. Veuillez vous reconnecter.');
      } else if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data));
      } else {
        throw new Error('Erreur lors de la création de la consultation');
      }
    }
  },

  /**
   * Mettre à jour une consultation existante
   */
  async updateConsultation(consultationId, consultationData) {
    try {
      console.log('📤 PUT Mise à jour consultation:', consultationId);
      
      // ✅ Utiliser api au lieu d'axios
      const response = await api.put(
        `${API_BASE_URL}/${consultationId}`, 
        consultationData
      );
      
      console.log('✅ Consultation mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Récupérer une consultation par son ID
   */
  async getConsultationById(consultationId) {
    try {
      console.log('📤 GET Consultation:', consultationId);
      
      // ✅ Utiliser api au lieu d'axios
      const response = await api.get(`${API_BASE_URL}/consultation/${consultationId}`);
      
      console.log('✅ Consultation reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Sauvegarder temporairement les données du formulaire (brouillon en mémoire)
   */
  saveDraft(formData) {
    try {
      this._draft = { ...formData, savedAt: new Date().toISOString() };
      console.log('💾 Brouillon sauvegardé:', this._draft);
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
        console.log('📄 Brouillon récupéré:', this._draft);
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
      console.log('🗑️ Brouillon supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression brouillon:', error);
    }
  },

  // Variable privée pour stocker le brouillon en mémoire
  _draft: null
};

export default consultationService;