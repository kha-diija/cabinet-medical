// src/services/documentService.js
import { authService } from '../../services/authService';

class DocumentService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api';
    }

    /**
     * Charge un document et le convertit en Data URL
     * @param {string} documentPath - Chemin du document (peut être une URL complète ou relative)
     * @returns {Promise<string>} Data URL (base64)
     */
    async loadAsDataUrl(documentPath) {
        if (!documentPath) {
            throw new Error('Aucun chemin de document fourni');
        }

        console.log('🔍 [DocumentService] Chargement:', documentPath);

        try {
            let fileName = documentPath;

            // ✅ Si c'est une URL Supabase complète, extraire le nom du fichier
            if (documentPath.includes('supabase.co')) {
                // Extraire après "logos/"
                const match = documentPath.match(/logos\/(.+)$/);
                if (match) {
                    fileName = match[1];
                    console.log('📎 [DocumentService] Fichier extrait de Supabase:', fileName);
                }
            } else if (documentPath.includes('/')) {
                // URL localhost ou autre
                const urlParts = documentPath.split('/');
                fileName = urlParts[urlParts.length - 1];
            }

            // Utiliser l'endpoint backend
            const finalUrl = `${this.baseURL}/public/logos/${encodeURIComponent(fileName)}`;
            console.log('🌐 [DocumentService] URL API:', finalUrl);

            const response = await fetch(finalUrl, {
                method: 'GET'
            });

            console.log('📡 [DocumentService] Réponse:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [DocumentService] Erreur HTTP:', response.status, errorText);
                throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
            }

            const blob = await response.blob();
            console.log('📦 [DocumentService] Blob reçu:', blob.type, blob.size, 'bytes');

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log('✅ [DocumentService] Conversion réussie');
                    resolve(reader.result);
                };
                reader.onerror = (error) => {
                    console.error('❌ [DocumentService] Erreur conversion:', error);
                    reject(new Error('Erreur conversion blob'));
                };
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('❌ [DocumentService] Erreur:', error);
            throw error;
        }
    }
    /**
     * Obtient l'URL complète pour afficher un document
     * @param {string} documentPath - Chemin du document
     * @returns {string} URL complète avec token
     */
    getViewUrl(documentPath) {
        if (!documentPath) return null;

        let fileName = documentPath;
        if (documentPath.includes('supabase.co') || documentPath.includes('localhost:8080')) {
            const urlParts = documentPath.split('/');
            fileName = urlParts[urlParts.length - 1];
        }

        const token = authService.getToken();
        return `${this.baseURL}/admin/documents/view?path=${encodeURIComponent(fileName)}&token=${token}`;
    }
}

export default new DocumentService();