import axios from "axios"

const API_BASE_URL = "http://localhost:8080/api/medicaments"

// Instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Ajouter le token JWT aux requêtes (si disponible)
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

// Gestion des erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

const MedicamentService = {
  // ✅ Récupérer tous les médicaments
  getAllMedicaments: async () => {
    try {
      const response = await api.get("")
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des médicaments:", error)
      throw error
    }
  },

  // ✅ Créer un médicament
  creerMedicament: async (medicament) => {
    try {
      const response = await api.post("", medicament)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la création du médicament:", error)
      throw error
    }
  },

  // ✅ Modifier un médicament
  modifierMedicament: async (id, medicament) => {
    try {
      const response = await api.put(`/${id}`, medicament)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la modification du médicament:", error)
      throw error
    }
  },

  // ✅ Supprimer un médicament (soft delete)
  supprimerMedicament: async (id) => {
    try {
      await api.delete(`/${id}`)
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression du médicament:", error)
      throw error
    }
  },

  // ✅ Rechercher des médicaments
  rechercherMedicaments: async (search) => {
    try {
      const response = await api.get("/search", {
        params: { search },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      throw error
    }
  },

  // ✅ Autocomplétion
  autocompletion: async (nom) => {
    try {
      const response = await api.get("/autocomplete", {
        params: { nom },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors de l'autocomplétion:", error)
      throw error
    }
  },

  // ✅ Importer un fichier CSV
  importerCSV: async (file) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Erreur lors de l'import CSV:", error)
      throw error
    }
  },

  // ✅ Exporter en CSV
  exporterCSV: async () => {
  try {
    const response = await api.get("/export", { responseType: "blob" });

    // Blob directement, pas besoin de BOM côté front
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "medicaments.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  } catch (error) {
    console.error("Erreur lors de l'export CSV:", error);
    throw error;
  }
}


}

export default MedicamentService
