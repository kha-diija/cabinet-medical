import axios from "axios";

const API_URL = "http://localhost:8080/api/demandes";

// 1. Créer une instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. L'INTERCEPTEUR (C'est lui qui ajoute le token "Bearer ey..." automatiquement)
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token"); // Vérifiez que c'est bien "token" et pas "jwt"
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

class DemandeService {
  // 1️⃣ Récupérer toutes les demandes
  getAll() {
    return api.get("").then(res => res.data); // Notez l'utilisation de 'api' et non 'axios'
  }

  // 2️⃣ Récupérer les demandes par statut
   getByStatut(statut) {
  return api.get(`?statut=${statut}`).then(res => res.data);
}


  // 3️⃣ Approuver une demande
  approuver(id) {
  return api.post(`/${id}/approuver`);
}


  // 4️⃣ Rejeter une demande
  rejeter(id, commentaire) {
  return api.post(`/${id}/rejeter`, { commentaire });
}
}

export default new DemandeService();