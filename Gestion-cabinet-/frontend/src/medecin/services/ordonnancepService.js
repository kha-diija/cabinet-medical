// ✅ IMPORTER api depuis authService
import { api } from './authService';

const API_BASE_URL = '/medecin/ordonnances';

const ordonnanceService = {
  /**
   * Récupérer la consultation EN_COURS
   */
  async getConsultationEnCours() {
    try {
      console.log('📤 GET Consultation EN_COURS');
      
      const response = await api.get(`${API_BASE_URL}/consultation-en-cours`);
      console.log('✅ Consultation EN_COURS reçue:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération consultation EN_COURS:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        return null; // Aucune consultation en cours
      }
      
      throw error;
    }
  },

  /**
   * Récupérer les ordonnances d'une consultation
   */
  async getOrdonnancesByConsultation(consultationId) {
    try {
      if (!consultationId) {
        console.error('❌ ConsultationId manquant');
        return [];
      }
      
      const url = `${API_BASE_URL}/consultation/${consultationId}`;
      console.log('📤 GET Ordonnances:', url);
      
      const response = await api.get(url);
      console.log('✅ Ordonnances reçues:', response.data);
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur récupération ordonnances:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Créer une ordonnance médicaments
   */
  async createOrdonnanceMedicaments(contenu) {
    try {
      console.log('📤 POST Création ordonnance MEDICAMENTS');
      console.log('📤 Contenu:', contenu);
      
      const response = await api.post(`${API_BASE_URL}/medicaments`, {
        type: 'MEDICAMENTS',
        contenu: contenu
      });
      
      console.log('✅ Ordonnance MEDICAMENTS créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création ordonnance MEDICAMENTS:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data));
      }
      throw new Error('Erreur lors de la création de l\'ordonnance médicaments');
    }
  },

  /**
   * Créer une ordonnance examens
   */
  async createOrdonnanceExamens(contenu, examens) {
    try {
      console.log('📤 POST Création ordonnance EXAMENS');
      console.log('📤 Contenu:', contenu);
      console.log('📤 Examens:', examens);
      
      const response = await api.post(`${API_BASE_URL}/examens`, {
        type: 'EXAMENS',
        contenu: contenu,
        examens: examens
      });
      
      console.log('✅ Ordonnance EXAMENS créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création ordonnance EXAMENS:', {
        status: error.response?.status,
        message: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data));
      }
      throw new Error('Erreur lors de la création de l\'ordonnance examens');
    }
  },

  /**
   * Mettre à jour une ordonnance
   */
  async updateOrdonnance(ordonnanceId, contenu, examens = null) {
    try {
      console.log('📤 PUT Mise à jour ordonnance:', ordonnanceId);
      
      const requestData = {
        contenu: contenu
      };
      
      if (examens) {
        requestData.examens = examens;
      }
      
      const response = await api.put(
        `${API_BASE_URL}/${ordonnanceId}`, 
        requestData
      );
      
      console.log('✅ Ordonnance mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour ordonnance:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Supprimer une ordonnance
   */
  async deleteOrdonnance(ordonnanceId) {
    try {
      console.log('📤 DELETE Ordonnance:', ordonnanceId);
      
      const response = await api.delete(`${API_BASE_URL}/${ordonnanceId}`);
      
      console.log('✅ Ordonnance supprimée:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression ordonnance:', error.response?.data || error);
      throw error;
    }
  },

  /**
   * Rechercher des médicaments
   */
  async searchMedicaments(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      
      console.log('📤 GET Recherche médicaments:', query);
      
      const response = await api.get(`${API_BASE_URL}/medicaments/search`, {
        params: { q: query }
      });
      
      console.log('✅ Médicaments trouvés:', response.data.length);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erreur recherche médicaments:', error.response?.data || error);
      return [];
    }
  }
};

export default ordonnanceService;