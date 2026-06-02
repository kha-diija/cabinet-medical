// src/services/apiService.js
// Service API amélioré avec meilleure gestion des erreurs

const API_BASE_URL = 'http://localhost:8080/api';

const getToken = () => {
    return localStorage.getItem('token');
};

// Fonction améliorée pour gérer les réponses
const handleResponse = async (response) => {
    console.log(`📡 Response: ${response.status} ${response.statusText}`, response.url);

    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    // Si la réponse n'est pas OK
    if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;

        try {
            // Vérifier si c'est du JSON
            if (contentType?.includes('application/json')) {
                const errorData = await response.json();
                console.error('❌ Error JSON:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
            }
            // Vérifier si c'est du HTML (erreur CORS ou serveur non configuré)
            else if (contentType?.includes('text/html')) {
                const htmlText = await response.text();
                console.error('❌ Réponse HTML reçue au lieu de JSON!');
                console.error('❌ Première ligne:', htmlText.substring(0, 100));

                // Erreur CORS probable
                if (htmlText.includes('<!doctype') || htmlText.includes('<!DOCTYPE')) {
                    errorMessage = 'Erreur de configuration CORS. Vérifiez votre serveur Spring Boot.';
                } else {
                    errorMessage = `Erreur serveur (${response.status})`;
                }
            }
            // Texte brut
            else {
                const textData = await response.text();
                console.error('❌ Error text:', textData.substring(0, 200));
                errorMessage = textData || errorMessage;
            }
        } catch (e) {
            console.error('❌ Erreur lors du parsing:', e);
        }

        throw new Error(errorMessage);
    }

    // Réponse OK - traiter le contenu
    try {
        // Vérifier si c'est du JSON
        if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Response data:', data);
            return data;
        }

        // Essayer de lire comme texte
        const text = await response.text();
        console.log('✅ Response text:', text);

        // Si vide, retourner null
        if (!text || text.trim() === '') {
            return null;
        }

        // Essayer de parser comme JSON au cas où
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    } catch (error) {
        console.error('❌ Erreur traitement réponse:', error);
        throw new Error('Erreur lors du traitement de la réponse');
    }
};

// Fonction générique pour les requêtes avec timeout et retry
const request = async (endpoint, options = {}, retries = 0) => {
    const token = getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    console.log(`🚀 API Call: ${options.method || 'GET'} ${endpoint}`);

    const config = {
        ...options,
        signal: controller.signal,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token && token !== 'fake-token' && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        clearTimeout(timeoutId);

        const data = await handleResponse(response);

        // Normaliser les données pour les endpoints qui retournent des listes
        if (endpoint.includes('/patients') && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
            if (!Array.isArray(data)) {
                console.warn('⚠️ Warning: Expected array but got:', typeof data);
                if (data && data.content && Array.isArray(data.content)) {
                    console.log('✅ Found paginated data');
                    return data.content;
                }
                return [];
            }
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        // Gérer timeout
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout');
            throw new Error('Délai d\'attente dépassé. Vérifiez que le serveur est démarré.');
        }

        // Gérer erreurs réseau
        if (error.message === 'Failed to fetch') {
            throw new Error('Impossible de se connecter au serveur. Vérifiez que Spring Boot est démarré sur le port 8080.');
        }

        console.error(`❌ API Error [${endpoint}]:`, error.message);
        throw error;
    }
};

// Services API
const apiService = {
    // ==================== HEALTH CHECK ====================
    health: async () => {
        try {
            const data = await request('/health');
            return data || { status: 'unknown' };
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return { status: 'down', error: error.message };
        }
    },

    // ==================== PATIENTS ====================
    patients: {
        getAll: async () => {
            try {
                const data = await request('/secretaire/patients');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getAll patients:', error);
                throw error;
            }
        },

        getById: (id) => request(`/secretaire/patients/${id}`),

        create: (patientData) => request('/secretaire/patients', {
            method: 'POST',
            body: JSON.stringify(patientData),
        }),

        update: (id, patientData) => request(`/secretaire/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patientData),
        }),

        delete: (id) => request(`/secretaire/patients/${id}`, {
            method: 'DELETE',
        }),

        searchByNom: async (nom) => {
            try {
                const data = await request(`/secretaire/patients/search/nom?nom=${encodeURIComponent(nom)}`);
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur searchByNom:', error);
                return [];
            }
        },

        searchByCin: async (cin) => {
            try {
                const data = await request(`/secretaire/patients/search/cin/${cin}`);
                return Array.isArray(data) ? data : [data];
            } catch (error) {
                console.error('❌ Erreur searchByCin:', error);
                return [];
            }
        },
        search: async (query) => {
            try {
                const data = await request(`/secretaire/patients/search?q=${encodeURIComponent(query)}`);

                return Array.isArray(data) ? data : (data ? [data] : []);
            } catch (error) {
                console.error('❌ Erreur search:', error);
                return [];
            }
        },

    },

    // ==================== RENDEZ-VOUS ====================
    rendezVous: {
        getAll: async () => {
            try {
                const data = await request('/secretaire/rendez-vous');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getAll rendezVous:', error);
                return [];
            }
        },

        getDuJour: async () => {
            try {
                const data = await request('/secretaire/rendez-vous/jour');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getDuJour:', error);
                throw error;
            }
        },

        getById: (id) =>
            request(`/secretaire/rendez-vous/${id}`),

        create: (rdvData) =>
            request('/secretaire/rendez-vous', {
                method: 'POST',
                body: JSON.stringify(rdvData),
            }),

        update: (id, rdvData) =>
            request(`/secretaire/rendez-vous/${id}`, {
                method: 'PUT',
                body: JSON.stringify(rdvData),
            }),

        delete: (id) =>
            request(`/secretaire/rendez-vous/${id}`, {
                method: 'DELETE',
            }),

        updateStatut: (id, statut) =>
            request(`/secretaire/rendez-vous/${id}/statut?statut=${statut}`, {
                method: 'PATCH',
            }),

        getByDate: (date) =>
            request(`/secretaire/rendez-vous/jour?date=${date}`),

        getByMedecin: (medecinId, date) =>
            request(`/secretaire/rendez-vous/medecin/${medecinId}?date=${date}`),

        getByPatient: (patientId) =>
            request(`/secretaire/rendez-vous/patient/${patientId}`),

        getCreneauxDisponibles: (medecinId, date) =>
            request(`/secretaire/rendez-vous/disponibilites?medecinId=${medecinId}&date=${date}`)
    },

    // ==================== FACTURES ====================
    factures: {
        getAll: async () => {
            try {
                console.log('🔍 Tentative de récupération des factures...');
                const data = await request('/secretaire/factures');
                console.log('📊 Factures brutes reçues:', data);

                // Normaliser la réponse
                if (Array.isArray(data)) {
                    return data;
                }

                // Si c'est un objet avec une propriété "content" (pagination)
                if (data && Array.isArray(data.content)) {
                    console.log('✅ Factures paginées détectées');
                    return data.content;
                }

                // Si c'est un objet avec des factures ailleurs
                if (data && typeof data === 'object') {
                    console.warn('⚠️ Format de réponse inattendu:', Object.keys(data));
                }

                return [];
            } catch (error) {
                console.error('❌ Erreur getAll factures:', error);
                throw error;
            }
        },

        getById: (id) => request(`/secretaire/factures/${id}`),

        validerPaiement: (id, modePaiement) => request(`/secretaire/factures/${id}/valider-paiement`, {
            method: 'PATCH',
            body: JSON.stringify({ modePaiement }),
        }),

        annuler: (id) => request(`/secretaire/factures/${id}/annuler`, {
            method: 'PATCH',
        }),
        modifier: async (id, factureData) => {
            try {
                console.log('✏️ Modification de la facture:', id, factureData);
                const data = await request(`/secretaire/factures/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(factureData),
                });
                console.log('✅ Facture modifiée:', data);
                return data;
            } catch (error) {
                console.error('❌ Erreur modification facture:', error);
                throw error;
            }
        },

        imprimer: async (id) => {
            try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/secretaire/factures/${id}/imprimer`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/pdf',
                        ...(token && token !== 'fake-token' && { 'Authorization': `Bearer ${token}` }),
                    },
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la génération du PDF');
                }

                return await response.blob();
            } catch (error) {
                console.error('❌ Erreur impression facture:', error);
                throw error;
            }
        },

        getByPatient: async (patientId) => {
            try {
                const data = await request(`/secretaire/factures/patient/${patientId}`);
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getByPatient:', error);
                return [];
            }
        },
    },

    // ==================== MESSAGERIE ====================
    messagerie: {
        /**
         * Récupère les messages reçus (gère la pagination)
         */
        getMessagesRecus: async () => {
            try {
                const data = await request('/messagerie/recus');
                // ✅ Extraire content si c'est une page Spring
                return data?.content || (Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('❌ Erreur getMessagesRecus:', error);
                return [];
            }
        },

        /**
         * Récupère les messages envoyés (gère la pagination)
         */
        getMessagesEnvoyes: async () => {
            try {
                const data = await request('/messagerie/envoyes');
                // ✅ Extraire content si c'est une page Spring
                return data?.content || (Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('❌ Erreur getMessagesEnvoyes:', error);
                return [];
            }
        },

        /**
         * Récupère la liste des médecins disponibles
         */
        getMedecinsDisponibles: async () => {
            try {
                const data = await request('/messagerie/medecins');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getMedecinsDisponibles:', error);
                return [];
            }
        },

        /**
         * Récupère la conversation avec un utilisateur
         */
        getConversation: async (utilisateurId) => {
            try {
                const data = await request(`/messagerie/conversation/${utilisateurId}`);
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getConversation:', error);
                return [];
            }
        },

        /**
         * Envoie un message texte
         */
        envoyerMessage: (messageData) => request('/messagerie', {
            method: 'POST',
            body: JSON.stringify(messageData),
        }),

        /**
         * Envoie un message avec fichier (audio ou document)
         */
        envoyerMessageAvecFichier: async (messageData, file) => {
            const formData = new FormData();
            formData.append('message', new Blob([JSON.stringify(messageData)], {
                type: 'application/json'
            }));

            if (file) {
                formData.append('file', file);
            }

            // ⚠️ Utiliser fetch directement pour FormData (pas request())
            const response = await fetch(`${API_BASE_URL}/messagerie/avec-fichier`, {
                method: 'POST',
                headers: {
                    // Ne pas mettre Content-Type pour FormData
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi du fichier');
            }

            return response.json();
        },

        /**
         * Marque un message comme lu
         */
        marquerCommeLu: (id) => request(`/messagerie/${id}/marquer-lu`, {
            method: 'PATCH',
        }),

        /**
         * Supprime un message
         */
        supprimerMessage: (id) => request(`/messagerie/${id}`, {
            method: 'DELETE',
        }),

        /**
         * Compte les messages non lus
         */
        countMessagesNonLus: async () => {
            try {
                const data = await request('/messagerie/non-lus/count');
                return typeof data === 'number' ? data : 0;
            } catch (error) {
                console.error('❌ Erreur countMessagesNonLus:', error);
                return 0;
            }
        },
    },
    // ==================== DASHBOARD ====================
    dashboard: {
        getStats: async () => {
            try {
                const data = await request('/secretaire/dashboard/stats');
                return data || {};
            } catch (error) {
                console.error('❌ Erreur getStats:', error);
                throw error;
            }
        },

        getRdvSemaine: async () => {
            try {
                const data = await request('/secretaire/dashboard/rdv-semaine');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getRdvSemaine:', error);
                return [];
            }
        },

        getRdvStatuts: async () => {
            try {
                const data = await request('/secretaire/dashboard/rdv-statuts');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getRdvStatuts:', error);
                return [];
            }
        },

        getPatientsEvolution: async () => {
            try {
                const data = await request('/secretaire/dashboard/patients-evolution');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getPatientsEvolution:', error);
                return [];
            }
        },
        //?  GET      [/api/secretaire/dashboard/revenus-mensuels] -> DashboardController.getRevenusMensuels()

        getRevenusMensuels: async () => {
            try {
                const data = await request('/secretaire/dashboard/revenus-mensuels');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getRevenusMensuels:', error);
                return [];
            }
        }
    },
    // ==================== NOTIFICATIONS ====================
    notifications: {
        getMedecinsDuCabinet: async () => {
            try {
                const data = await request('/secretaire/notifications/medecins');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getMedecinsDuCabinet:', error);
                return [];
            }
        },

        envoyer: (notificationData) => request('/secretaire/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData),
        }),

        getNotificationsEnvoyees: async () => {
            try {
                const data = await request('/secretaire/notifications/envoyees');
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('❌ Erreur getNotificationsEnvoyees:', error);
                return [];
            }
        },
    },

// ==================== PARAMETRES ====================
    parametres: {
        getProfile: () => request('/utilisateur/profile'),

        updateProfile: (profileData) => request('/utilisateur/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),

        changePassword: (passwordData) => request('/utilisateur/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData),
        }),
    },

};

export default apiService;