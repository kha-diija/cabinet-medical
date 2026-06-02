import axios from "axios";

// URL de base
const API_BASE_URL = "http://localhost:8080/api/admin-factures";

// 1. Créer une instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Ajouter un "Intercepteur" : C'est un vigile qui ajoute le token à chaque requête qui part
api.interceptors.request.use(
    (config) => {
      // Récupérer le token stocké lors du login (assurez-vous que la clé est bien "token")
      const token = localStorage.getItem("token");
      if (token) {
        // Ajouter l'en-tête Authorization: Bearer eyJhbGciOi...
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

class InvoicesService {
  // Récupérer toutes les factures
  getAll() {
    // On utilise l'instance 'api' (qui contient le token) et non 'axios' direct
    return api.get("").then((res) => res.data);
  }

  // Mettre à jour facture (montant + période)
  update(id, data) {
    return api.put(`/${id}`, data).then((res) => res.data);
  }

  // Marquer comme payée
  markAsPaid(id) {
    return api.post(`/${id}/payer`).then((res) => res.data);
  }
}

export default new InvoicesService();