// src/medecin/services/medecinMessagerieService.js
import { api } from './authService';

const BASE_URL = '/medecin/messagerie';

export const medecinMessagerieService = {
    /**
     * Messages reçus (paginés)
     */
    getMessagesRecus: async (page = 0, size = 20) => {
        try {
            const response = await api.get(`${BASE_URL}/recus?page=${page}&size=${size}`);
            console.log('📥 Messages reçus:', response.data);
            return response.data.content || response.data;
        } catch (error) {
            console.error('❌ Erreur getMessagesRecus:', error);
            throw error;
        }
    },

    /**
     * Messages envoyés (paginés)
     */
    getMessagesEnvoyes: async (page = 0, size = 20) => {
        try {
            const response = await api.get(`${BASE_URL}/envoyes?page=${page}&size=${size}`);
            console.log('📤 Messages envoyés:', response.data);
            return response.data.content || response.data;
        } catch (error) {
            console.error('❌ Erreur getMessagesEnvoyes:', error);
            throw error;
        }
    },

    /**
     * Message par ID
     */
    getMessageById: async (id) => {
        try {
            const response = await api.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getMessageById:', error);
            throw error;
        }
    },

    /**
     * Envoyer un message texte
     */
    envoyerMessage: async (messageData) => {
        try {
            const response = await api.post(BASE_URL, messageData);
            console.log('✅ Message envoyé:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur envoyerMessage:', error);
            throw error;
        }
    },

    /**
     * Envoyer un message avec fichier (audio ou document)
     */
    envoyerMessageAvecFichier: async (messageData, file) => {
        try {
            const formData = new FormData();
            formData.append('message', new Blob([JSON.stringify(messageData)], {
                type: 'application/json'
            }));

            if (file) {
                formData.append('file', file);
            }

            const response = await api.post(`${BASE_URL}/avec-fichier`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('✅ Message avec fichier envoyé:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur envoyerMessageAvecFichier:', error);
            throw error;
        }
    },

    /**
     * Marquer comme lu
     */
    marquerCommeLu: async (id) => {
        try {
            const response = await api.patch(`${BASE_URL}/${id}/marquer-lu`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur marquerCommeLu:', error);
            throw error;
        }
    },

    /**
     * Compter messages non lus
     */
    countMessagesNonLus: async () => {
        try {
            const response = await api.get(`${BASE_URL}/non-lus/count`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur countMessagesNonLus:', error);
            return 0;
        }
    },

    /**
     * Supprimer message
     */
    supprimerMessage: async (id) => {
        try {
            await api.delete(`${BASE_URL}/${id}`);
            console.log('🗑️ Message supprimé:', id);
        } catch (error) {
            console.error('❌ Erreur supprimerMessage:', error);
            throw error;
        }
    },

    /**
     * Conversation avec un utilisateur
     */
    getConversation: async (utilisateurId) => {
        try {
            const response = await api.get(`${BASE_URL}/conversation/${utilisateurId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getConversation:', error);
            return [];
        }
    },

    /**
     * Liste des secrétaires disponibles
     */
    getSecretairesDisponibles: async () => {
        try {
            const response = await api.get(`${BASE_URL}/secretaires`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getSecretairesDisponibles:', error);
            return [];
        }
    }
};

export default medecinMessagerieService;