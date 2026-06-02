// src/services/rendezVousService.js
import { api } from './authService';

const rendezVousService = {
  /**
   * Récupère les rendez-vous d'aujourd'hui
   */
  getTodayRendezVous: async () => {
    try {
      const response = await api.get('/medecin/rendez-vous/aujourdhui');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement rendez-vous aujourd\'hui:', error);
      throw error;
    }
  },

  /**
   * Récupère les rendez-vous par date
   */
  getRendezVousByDate: async (date) => {
    try {
      const response = await api.get(`/medecin/rendez-vous/par-date?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement rendez-vous par date:', error);
      throw error;
    }
  },

  /**
   * Récupère les rendez-vous de la semaine
   */
  getRendezVousSemaine: async (dateDebut) => {
    try {
      const response = await api.get(`/medecin/rendez-vous/semaine?dateDebut=${dateDebut}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement rendez-vous semaine:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques du jour
   */
  getTodayStatistics: async () => {
    try {
      const response = await api.get('/medecin/rendez-vous/statistiques/aujourdhui');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      throw error;
    }
  },

  /**
   * Change le statut d'un rendez-vous
   */
  changeRendezVousStatut: async (idRendezVous, statut) => {
    try {
      const response = await api.put(`/medecin/rendez-vous/${idRendezVous}/statut`, {
        statut: statut
      });
      return response.data;
    } catch (error) {
      console.error('Erreur changement statut:', error);
      throw error;
    }
  },

  /**
   * Marque le patient comme arrivé
   */
  marquerPatientArrive: async (idRendezVous) => {
    try {
      const response = await api.put(`/medecin/rendez-vous/${idRendezVous}/patient-arrive`);
      return response.data;
    } catch (error) {
      console.error('Erreur marquage patient arrivé:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques du dashboard
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/medecin/rendez-vous/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement stats dashboard:', error);
      throw error;
    }
  },

  /**
   * Crée un nouveau rendez-vous
   */
  createRendezVous: async (rendezVousData) => {
    try {
      const response = await api.post('/medecin/rendez-vous', rendezVousData);
      return response.data;
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      throw error;
    }
  },

  /**
   * Met à jour un rendez-vous
   */
  updateRendezVous: async (idRendezVous, rendezVousData) => {
    try {
      const response = await api.put(`/medecin/rendez-vous/${idRendezVous}`, rendezVousData);
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour rendez-vous:', error);
      throw error;
    }
  },

  /**
   * Supprime un rendez-vous
   */
  deleteRendezVous: async (idRendezVous) => {
    try {
      const response = await api.delete(`/medecin/rendez-vous/${idRendezVous}`);
      return response.data;
    } catch (error) {
      console.error('Erreur suppression rendez-vous:', error);
      throw error;
    }
  },

  /**
   * Recherche des rendez-vous
   */
  searchRendezVous: async (searchTerm) => {
    try {
      const response = await api.get(`/medecin/rendez-vous/recherche?terme=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Erreur recherche rendez-vous:', error);
      throw error;
    }
  },

  /**
   * Récupère le prochain rendez-vous
   */
  getProchainRendezVous: async () => {
    try {
      const response = await api.get('/medecin/rendez-vous/prochain');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement prochain rendez-vous:', error);
      throw error;
    }
  },

  /**
   * Récupère les rendez-vous en attente
   */
  getRendezVousEnAttente: async () => {
    try {
      const response = await api.get('/medecin/rendez-vous/en-attente');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement rendez-vous en attente:', error);
      throw error;
    }
  }
};

export default rendezVousService;