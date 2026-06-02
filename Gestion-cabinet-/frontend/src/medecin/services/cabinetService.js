// cabinetService.js - Service pour la gestion des cabinets
import { api } from './authService'; // Importez l'instance api

const cabinetService = {
    getCabinetInfo: async () => {
        try {
            console.log('🔄 [Cabinet] Appel API: GET /cabinet/info');
            
            // DEBUG: Vérifier le token avant l'appel
            const token = localStorage.getItem('token');
            console.log('🔑 [Cabinet] Token disponible:', token ? 'OUI' : 'NON');
            
            const response = await api.get('/cabinet/info');
            console.log('✅ [Cabinet] Données reçues:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Cabinet] Erreur détaillée:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                headers: error.config?.headers
            });
            
            if (error.response?.status === 403) {
                console.error('🚫 [Cabinet] Accès interdit - Vérifiez les permissions');
            }
            
            throw error;
        }
    },
    
    // NOUVEAU: Méthode alternative si l'endpoint /cabinet/info n'existe pas
    getCurrentUserCabinet: async () => {
        try {
            console.log('🔄 [Cabinet] Appel API: GET /api/cabinets/current');
            
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            
            if (user && user.cabinetId) {
                console.log(`🔄 [Cabinet] Récupération cabinet ID: ${user.cabinetId}`);
                const response = await api.get(`/api/cabinets/${user.cabinetId}`);
                console.log('✅ [Cabinet] Cabinet reçu:', response.data);
                return response.data;
            }
            
            console.warn('⚠️ [Cabinet] Aucun cabinetId trouvé dans user');
            return null;
        } catch (error) {
            console.error('❌ [Cabinet] Erreur getCurrentUserCabinet:', error);
            return null;
        }
    }
};

export default cabinetService;