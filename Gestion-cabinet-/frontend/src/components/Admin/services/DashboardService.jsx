import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/dashboard";

// ✅ Instance axios configurée
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 INTERCEPTOR REQUEST: Injection automatique du token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔑 Token JWT envoyé:", token.substring(0, 20) + "...");
        } else {
            console.warn("⚠️ Aucun token JWT trouvé dans localStorage");
            // ✅ Rejeter immédiatement si pas de token
            return Promise.reject(new Error("No token available"));
        }
        return config;
    },
    (error) => {
        console.error("❌ Erreur dans l'interceptor request:", error);
        return Promise.reject(error);
    }
);

// 🔄 INTERCEPTOR RESPONSE: Gestion erreur 401/403
api.interceptors.response.use(
    (response) => {
        console.log("✅ Réponse API réussie:", response.config.url);
        return response;
    },
    (error) => {
        if (error.message === "No token available") {
            // ✅ Erreur silencieuse, on ne redirige pas
            console.log("🔕 Requête annulée : pas de token");
            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                console.error("❌ 401 Unauthorized - Token invalide ou expiré");
                // ✅ NE PAS supprimer le token ici
                // ✅ NE PAS rediriger ici, laisser le composant gérer
            } else if (status === 403) {
                console.error("❌ 403 Forbidden - Accès refusé (rôle insuffisant)");
                // ✅ Pas d'alert ici, géré dans le composant
            } else {
                console.error("❌ Erreur API:", status, error.message);
            }
        }

        return Promise.reject(error);
    }
);

const DashboardService = {
    /**
     * ✅ Récupérer toutes les stats du dashboard
     */
    getDashboardData: async () => {
        try {
            // ✅ Vérification préalable du token
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("⏭️ Pas de token, skip getDashboardData");
                throw new Error("No authentication token");
            }

            const response = await api.get("/stats");
            console.log("📊 Données dashboard récupérées:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Erreur lors de la récupération du dashboard:", error);
            throw error;
        }
    },

    /**
     * ⚠️ OPTIONNEL: Méthode pour le résumé mensuel seul
     */
    getMonthlySummary: async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("⏭️ Pas de token, skip getMonthlySummary");
                throw new Error("No authentication token");
            }

            const response = await api.get("/monthly-summary");
            console.log("📈 Résumé mensuel récupéré:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Erreur lors de la récupération du résumé mensuel:", error);
            throw error;
        }
    },
};

export default DashboardService;