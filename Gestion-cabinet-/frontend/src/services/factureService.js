import api from './api';

export const factureService = {
    getAll: (page = 0, size = 10) =>
        api.get(`/secretaire/factures?page=${page}&size=${size}`),

    getById: (id) =>
        api.get(`/secretaire/factures/${id}`),

    create: (factureData) =>
        api.post('/secretaire/factures', factureData),

    update: (id, factureData) =>
        api.put(`/secretaire/factures/${id}`, factureData),

    validerPaiement: (id, modePaiement) =>
        api.patch(`/secretaire/factures/${id}/valider-paiement?modePaiement=${modePaiement}`),

    annuler: (id) =>
        api.patch(`/secretaire/factures/${id}/annuler`),

    getByStatut: (statut) =>
        api.get(`/secretaire/factures/statut/${statut}`),

    getByPatient: (patientId) =>
        api.get(`/secretaire/factures/patient/${patientId}`),

    getByPeriode: (dateDebut, dateFin) =>
        api.get(`/secretaire/factures/periode?dateDebut=${dateDebut}&dateFin=${dateFin}`),

    imprimer: (id) =>
        api.get(`/secretaire/factures/${id}/imprimer`, { responseType: 'blob' })
};
