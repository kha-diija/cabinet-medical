import api from './api';

export  const patientService = {
    getAll: (page = 0, size = 10) =>
        api.get(`/secretaire/patients?page=${page}&size=${size}`),

    getById: (id) =>
        api.get(`/secretaire/patients/${id}`),

    create: (patientData) =>
        api.post('/secretaire/patients', patientData),

    update: (id, patientData) =>
        api.put(`/secretaire/patients/${id}`, patientData),

    delete: (id) =>
        api.delete(`/secretaire/patients/${id}`),

    searchByCin: (cin) =>
        api.get(`/secretaire/patients/search/cin/${cin}`),

    searchByNom: (nom, prenom = '') =>
        api.get(`/secretaire/patients/search/nom?nom=${nom}&prenom=${prenom}`),

    envoyerAuMedecin: (patientId, medecinId) =>
        api.post(`/secretaire/patients/${patientId}/envoyer-medecin/${medecinId}`)
};
export default patientService;