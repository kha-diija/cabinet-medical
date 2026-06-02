import api from './api';

export const rendezVousService = {
    getAll: (page = 0, size = 10) =>
        api.get(`/secretaire/rendez-vous?page=${page}&size=${size}`),

    getById: (id) =>
        api.get(`/secretaire/rendez-vous/${id}`),

    create: (rdvData) =>
        api.post('/secretaire/rendez-vous', rdvData),

    update: (id, rdvData) =>
        api.put(`/secretaire/rendez-vous/${id}`, rdvData),

    cancel: (id) =>
        api.delete(`/secretaire/rendez-vous/${id}`),

    updateStatut: (id, statut) =>
        api.patch(`/secretaire/rendez-vous/${id}/statut?statut=${statut}`),

    getByDate: (date) =>
        api.get(`/secretaire/rendez-vous/jour?date=${date}`),

    getByMedecin: (medecinId, date) =>
        api.get(`/secretaire/rendez-vous/medecin/${medecinId}?date=${date}`),

    getByPatient: (patientId) =>
        api.get(`/secretaire/rendez-vous/patient/${patientId}`),

    getCreneauxDisponibles: (medecinId, date) =>
        api.get(`/secretaire/rendez-vous/disponibilites?medecinId=${medecinId}&date=${date}`)
};
