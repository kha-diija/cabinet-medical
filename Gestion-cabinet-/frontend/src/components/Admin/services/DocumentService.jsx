import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/documents";

// 1. Créer une instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. L'INTERCEPTEUR (Ajoute le token automatiquement)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class DocumentService {
  /**
   * 📄 Obtenir l'URL complète pour afficher un document (pour <img> ou <embed>)
   * @param {string} documentUrl - L'URL Supabase du document
   * @returns {string} URL complète avec le token
   */
  getViewUrl(documentUrl) {
    if (!documentUrl) return null;
    const token = localStorage.getItem("token");
    return `${API_URL}/view?url=${encodeURIComponent(documentUrl)}&token=${token}`;
  }

  /**
   * 👁️ Voir un document dans un nouvel onglet
   * @param {string} documentUrl - L'URL Supabase du document
   */
  viewDocument(documentUrl) {
    if (!documentUrl) {
      console.error("❌ URL du document manquante");
      return;
    }
    
    // Ouvrir dans un nouvel onglet avec le token dans les headers
    api.get(`/view?url=${encodeURIComponent(documentUrl)}`, {
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }).catch(error => {
      console.error("❌ Erreur lors de l'ouverture du document:", error);
      alert("Impossible d'ouvrir le document");
    });
  }

  /**
   * 💾 Télécharger un document
   * @param {string} documentUrl - L'URL Supabase du document
   * @param {string} fileName - Nom du fichier pour le téléchargement (optionnel)
   */
  downloadDocument(documentUrl, fileName = "document") {
    if (!documentUrl) {
      console.error("❌ URL du document manquante");
      return;
    }

    return api.get(`/download?url=${encodeURIComponent(documentUrl)}`, {
      responseType: 'blob'
    }).then(response => {
      // Extraire le nom du fichier depuis les headers ou utiliser celui fourni
      const contentDisposition = response.headers['content-disposition'];
      let downloadFileName = fileName;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          downloadFileName = match[1];
        }
      }

      // Créer un lien temporaire pour télécharger
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("✅ Document téléchargé:", downloadFileName);
    }).catch(error => {
      console.error("❌ Erreur lors du téléchargement:", error);
      alert("Impossible de télécharger le document");
    });
  }

  /**
   * 🖼️ Charger un document en tant que Data URL (pour afficher dans <img>)
   * @param {string} documentUrl - L'URL Supabase du document
   * @returns {Promise<string>} Data URL du document
   */
  async loadAsDataUrl(documentUrl) {
    if (!documentUrl) return null;

    try {
      const response = await api.get(`/view?url=${encodeURIComponent(documentUrl)}`, {
        responseType: 'blob'
      });

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error("❌ Erreur lors du chargement du document:", error);
      throw error;
    }
  }

  /**
   * 📋 Vérifier si un document existe (accessible)
   * @param {string} documentUrl - L'URL Supabase du document
   * @returns {Promise<boolean>}
   */
  async documentExists(documentUrl) {
    if (!documentUrl) return false;

    try {
      await api.get(`/view?url=${encodeURIComponent(documentUrl)}`, {
        responseType: 'blob'
      });
      return true;
    } catch (error) {
      console.error("❌ Document inaccessible:", error);
      return false;
    }
  }
}

export default new DocumentService();