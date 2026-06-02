import api from './api';

export const messagerieService = {
    getRecus: (page = 0, size = 10) =>
        api.get(`/messagerie/recus?page=${page}&size=${size}`),

    getEnvoyes: (page = 0, size = 10) =>
        api.get(`/messagerie/envoyes?page=${page}&size=${size}`),

    getById: (id) =>
        api.get(`/messagerie/${id}`),

    envoyer: (messageData) => {
        const formData = new FormData();
        formData.append('message', JSON.stringify({
            idDestinataire: messageData.idDestinataire,
            objet: messageData.objet,
            contenu: messageData.contenu
        }));

        if (messageData.pieceJointe) {
            formData.append('pieceJointe', messageData.pieceJointe);
        }

        return api.post('/messagerie', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    marquerLu: (id) =>
        api.patch(`/messagerie/${id}/marquer-lu`),

    countNonLus: () =>
        api.get('/messagerie/non-lus/count'),

    supprimer: (id) =>
        api.delete(`/messagerie/${id}`),

    getConversation: (utilisateurId) =>
        api.get(`/messagerie/conversation/${utilisateurId}`),

    getMedecins: () =>
        api.get('/messagerie/medecins')
};