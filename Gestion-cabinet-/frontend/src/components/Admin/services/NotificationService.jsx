import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/alertes";

// 1. Créer une instance Axios configurée
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. L'INTERCEPTEUR pour ajouter le token automatiquement
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // ✅ Si pas de token, on rejette la requête immédiatement
            console.warn("⚠️ Tentative d'appel API sans token");
            return Promise.reject(new Error("No token available"));
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // ✅ Ne pas rediriger automatiquement, laisser les composants gérer ça
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                console.warn("🔒 Token expiré ou invalide (401)");
                // Ne pas supprimer le token ici, laisser le composant gérer
            } else if (status === 403) {
                console.warn("🔒 Accès refusé (403)");
            } else if (status === 500) {
                console.error("❌ Erreur serveur (500):", error.response.data);
            }
        } else if (error.message === "No token available") {
            // Erreur silencieuse quand pas de token
            console.log("🔕 Requête annulée : pas de token");
        }

        return Promise.reject(error);
    }
);

class NotificationService {
    // Récupérer les notifications non lues
    async getUnreadNotifications() {
        try {
            // ✅ Vérification préalable du token
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("⏭️ Pas de token, skip getUnreadNotifications");
                return [];
            }

            const response = await api.get("/non-lues");
            return response.data;
        } catch (error) {
            // ✅ Gestion silencieuse des erreurs d'authentification
            if (error.message === "No token available") {
                return [];
            }

            if (error.response) {
                const status = error.response.status;

                // Ne logger que les erreurs vraiment problématiques
                if (status !== 401 && status !== 403) {
                    console.error("Erreur lors de la récupération des notifications:", error);
                    console.error("Statut:", status);
                    console.error("Data:", error.response.data);
                }
            }

            return [];
        }
    }

    // Récupérer le nombre de notifications non lues
    async getUnreadCount() {
        try {
            // ✅ Vérification préalable du token
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("⏭️ Pas de token, skip getUnreadCount");
                return 0;
            }

            const response = await api.get("/count-non-lues");
            return response.data;
        } catch (error) {
            // ✅ Gestion silencieuse
            if (error.message === "No token available") {
                return 0;
            }

            if (error.response) {
                const status = error.response.status;

                // Ne logger que les erreurs vraiment problématiques
                if (status !== 401 && status !== 403) {
                    console.error("Erreur lors du comptage des notifications:", error);
                }
            }

            return 0;
        }
    }

    // Marquer une notification comme lue
    async markAsRead(notificationId) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("⏭️ Pas de token, skip markAsRead");
                return false;
            }

            await api.put(`/${notificationId}/marquer-lu`);
            return true;
        } catch (error) {
            if (error.message !== "No token available") {
                console.error("Erreur lors du marquage comme lu:", error);
            }
            return false;
        }
    }

    // Marquer toutes les notifications comme lues
    async markAllAsRead(notificationIds) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("⏭️ Pas de token, skip markAllAsRead");
                return false;
            }

            const promises = notificationIds.map(id =>
                api.put(`/${id}/marquer-lu`)
            );
            await Promise.all(promises);
            return true;
        } catch (error) {
            if (error.message !== "No token available") {
                console.error("Erreur lors du marquage de toutes les notifications:", error);
            }
            return false;
        }
    }
}

export default new NotificationService();