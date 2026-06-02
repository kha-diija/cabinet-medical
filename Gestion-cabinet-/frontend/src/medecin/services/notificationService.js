// notificationService.js - Service pour la gestion des notifications
import { api } from './authService'; // Importez l'instance api

const notificationService = {
    getNotifications: async () => {
        try {
            console.log('🔄 [Notifications] Appel API: GET /notifications');
            
            // DEBUG: Vérifier l'authentification
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('🔍 [Notifications] Vérification:', {
                hasToken: !!token,
                userRole: user.role
            });
            
            const response = await api.get('/notifications');
            console.log('✅ [Notifications] Données brutes reçues:', response.data);
            console.log(`📊 [Notifications] ${Array.isArray(response.data) ? response.data.length : 'N/A'} notifications`);
            return response.data;
        } catch (error) {
            console.error('❌ [Notifications] Erreur détaillée getNotifications:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url
            });
            
            if (error.response?.status === 403) {
                console.error('🚫 [Notifications] Accès interdit - Route peut nécessiter un rôle spécifique');
                console.error('💡 Essayez peut-être /api/notifications ou /medecin/notifications');
            }
            
            throw error;
        }
    },

    getUnreadCount: async () => {
        try {
            console.log('🔄 [Notifications] Appel API: GET /notifications/unread-count');
            
            const response = await api.get('/notifications/unread-count');
            console.log(`✅ [Notifications] Nombre non lues: ${response.data}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Notifications] Erreur getUnreadCount:', {
                message: error.message,
                status: error.response?.status
            });
            
            // Retourner 0 en cas d'erreur plutôt que de lancer une exception
            return 0;
        }
    },

    markAsRead: async (notificationId) => {
        try {
            console.log(`🔄 [Notifications] Marquage notification ${notificationId} comme lue`);
            
            await api.put(`/notifications/${notificationId}/read`);
            console.log(`✅ [Notifications] Notification ${notificationId} marquée comme lue`);
        } catch (error) {
            console.error('❌ [Notifications] Erreur markAsRead:', {
                error: error.message,
                status: error.response?.status
            });
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            console.log('🔄 [Notifications] Marquage de toutes les notifications comme lues');
            
            await api.put('/notifications/read-all');
            console.log('✅ [Notifications] Toutes les notifications marquées comme lues');
        } catch (error) {
            console.error('❌ [Notifications] Erreur markAllAsRead:', error);
            throw error;
        }
    },
    
    // NOUVEAU: Méthode alternative pour les notifications médecin
    getMedecinNotifications: async () => {
        try {
            console.log('🔄 [Notifications] Appel API: GET /medecin/notifications');
            
            const response = await api.get('/medecin/notifications');
            console.log(`✅ [Notifications] ${Array.isArray(response.data) ? response.data.length : 0} notifications médecin`);
            return response.data;
        } catch (error) {
            console.error('❌ [Notifications] Erreur getMedecinNotifications:', error);
            // Retourner un tableau vide plutôt que de lancer une exception
            return [];
        }
    },
    
    // NOUVEAU: Méthode pour tester différentes routes
    testNotificationRoutes: async () => {
        const routes = [
            '/notifications',
            '/api/notifications',
            '/medecin/notifications',
            '/medecin/dashboard/notifications'
        ];
        
        for (const route of routes) {
            try {
                console.log(`🔍 [Notifications] Test route: ${route}`);
                const response = await api.get(route);
                console.log(`✅ [Notifications] Route ${route} fonctionne:`, response.data);
                return { route, data: response.data };
            } catch (error) {
                console.log(`❌ [Notifications] Route ${route} échoue:`, error.response?.status);
            }
        }
        
        console.error('❌ [Notifications] Aucune route de notifications ne fonctionne');
        return null;
    }
};

export default notificationService;