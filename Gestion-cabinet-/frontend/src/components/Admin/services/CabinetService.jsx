import axios from "axios"

const API_BASE_URL = "http://localhost:8080/api/admin/cabinets"

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// 🔐 Injection automatique du token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ❌ Gestion erreur 401 = token expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

const CabinetService = {
  // ✅ Récupérer tous les cabinets
  getAllCabinets: async () => {
    try {
      const response = await api.get("")
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des cabinets:", error)
      throw error
    }
  },

  // ✅ Ajouter un cabinet
  ajouterCabinet: async (cabinet) => {
    try {
      const response = await api.post("", cabinet)
      return response.data
    } catch (error) {
      console.error("Erreur lors de l'ajout du cabinet:", error)
      throw error
    }
  },

  // ✅ Modifier un cabinet
  modifierCabinet: async (id, cabinet) => {
    try {
      const response = await api.put(`/${id}`, cabinet)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la modification du cabinet:", error)
      throw error
    }
  },

  // ❌ Soft Delete ? → Non, tu n'as pas de delete dans ton backend
  // Mais si tu veux l’ajouter plus tard, je peux te générer le code côté Spring.

  // ✅ Changer le statut (Actif / Inactif)
  changerStatut: async (id, actif) => {
    try {
      const response = await api.patch(`/${id}/status`, null, {
        params: { actif },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error)
      throw error
    }
  },

  // ✅ Recherche par nom
  rechercherCabinets: async (nom) => {
    try {
      const response = await api.get("/search", {
        params: { nom },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors de la recherche de cabinets:", error)
      throw error
    }
  },

  // (Optionnel) Autocomplete si tu veux l’ajouter dans ton backend
}

export default CabinetService
