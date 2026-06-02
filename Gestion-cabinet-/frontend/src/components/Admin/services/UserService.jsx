import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/utilisateurs";

// Instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter le token JWT aux requêtes (si disponible)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion des erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou non autorisé, rediriger vers login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const UserService = {
  // 🔹 Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const response = await api.get("");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  },

  // 🔹 Récupérer tous les cabinets (NOUVELLE MÉTHODE)
  getAllCabinets: async () => {
    try {
      // À ADAPTER: Remplacez cette URL par celle de votre backend pour les cabinets
      const response = await axios.get("http://localhost:8080/api/admin/cabinets", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des cabinets:", error);
      throw error;
    }
  },

  // 🔹 Créer un utilisateur (MODIFIÉ pour accepter cabinetNom en paramètre)
  creerUser: async (user, cabinetNom) => {
    try {
      // Structure CORRECTE pour le DTO backend
      const payload = {
        login: user.login,       // login = email
        nom: user.nom,
        prenom: user.prenom,
        numTel: user.numTel,
        role: user.role,
        nomCabinet: cabinetNom,  // Cabinet passé en paramètre séparé
      };

      console.log("Création utilisateur avec payload:", payload);
      const response = await api.post("", payload);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      console.error("Détails erreur:", error.response?.data);
      throw error;
    }
  },

  // 🔹 Modifier un utilisateur
  modifierUser: async (id, user) => {
    try {
      const response = await api.put(`/${id}`, user);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      throw error;
    }
  },

  // 🔹 Supprimer un utilisateur (soft delete possible)
  supprimerUser: async (id) => {
    try {
      await api.delete(`/${id}`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    }
  },

  // 🔹 Réinitialiser mot de passe
  resetPassword: async (id) => {
    try {
      await api.post(`/reset-password/${id}`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      throw error;
    }
  },

  // 🔹 Rechercher des utilisateurs
  rechercherUsers: async (search) => {
    try {
      const response = await api.get("/search", { params: { search } });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la recherche des utilisateurs:", error);
      throw error;
    }
  },
};

export default UserService;