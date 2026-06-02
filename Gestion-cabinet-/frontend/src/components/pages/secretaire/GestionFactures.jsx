import React, { useState, useEffect } from 'react';
import {
    FileText, DollarSign, Check, X,
    Printer, Filter, Calendar, User, AlertCircle, TrendingUp, Edit
} from 'lucide-react';
import apiService from '../../../services/apiService';
import './GestionFactures.css';

const GestionFactures = () => {
    const [factures, setFactures] = useState([]);
    const [filteredFactures, setFilteredFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatut, setFilterStatut] = useState('TOUTES');
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modePaiement, setModePaiement] = useState('ESPECES');

    // Nouveaux états pour la modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFacture, setEditingFacture] = useState(null);
    const [editFormData, setEditFormData] = useState({
        montant: '',
        modePaiement: '',
        dateEmission: ''
    });

    useEffect(() => {
        fetchFactures();
    }, []);

    useEffect(() => {
        filterFacturesByStatut();
    }, [filterStatut, factures]);

    const fetchFactures = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.factures.getAll();
            console.log('📋 Factures reçues:', data);
            setFactures(data);
        } catch (error) {
            console.error('❌ Erreur chargement factures:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterFacturesByStatut = () => {
        if (filterStatut === 'TOUTES') {
            setFilteredFactures(factures);
        } else {
            setFilteredFactures(factures.filter(f => f.statut === filterStatut));
        }
    };

    const handleValiderPaiement = async () => {
        if (!selectedFacture) return;

        try {
            await apiService.factures.validerPaiement(selectedFacture.idFacture, modePaiement);
            setShowPaymentModal(false);
            setSelectedFacture(null);
            fetchFactures();
        } catch (error) {
            console.error('Erreur validation:', error);
            alert('Erreur lors de la validation du paiement');
        }
    };

    const handleAnnulerFacture = async (factureId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
            return;
        }

        try {
            await apiService.factures.annuler(factureId);
            fetchFactures();
        } catch (error) {
            console.error('Erreur annulation:', error);
            alert('Erreur lors de l\'annulation de la facture');
        }
    };

    const handleModifierFacture = async () => {
        if (!editingFacture) return;

        try {
            const dataToSend = {
                montant: parseFloat(editFormData.montant),
                modePaiement: editFormData.modePaiement,
                dateEmission: editFormData.dateEmission,
                statut: editingFacture.statut // Conserver le statut actuel
            };

            await apiService.factures.modifier(editingFacture.idFacture, dataToSend);
            setShowEditModal(false);
            setEditingFacture(null);
            fetchFactures();
        } catch (error) {
            console.error('Erreur modification:', error);
            alert('Erreur lors de la modification de la facture');
        }
    };

    const openEditModal = (facture) => {
        setEditingFacture(facture);
        setEditFormData({
            montant: facture.montant,
            modePaiement: facture.modePaiement,
            dateEmission: facture.dateEmission
        });
        setShowEditModal(true);
    };

    const handleImprimerFacture = async (factureId) => {
        try {
            const blob = await apiService.factures.imprimer(factureId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture_${factureId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur impression:', error);
            alert('Erreur lors de l\'impression de la facture');
        }
    };

    const calculateStats = () => {
        const total = factures.length;
        const payees = factures.filter(f => f.statut === 'PAYEE').length;
        const enAttente = factures.filter(f => f.statut === 'EN_ATTENTE').length;
        const montantTotal = factures
            .filter(f => f.statut === 'PAYEE')
            .reduce((sum, f) => sum + parseFloat(f.montant), 0);

        return { total, payees, enAttente, montantTotal };
    };

    const getStatutLabel = (statut) => {
        const labels = {
            'PAYEE': 'Payée',
            'EN_ATTENTE': 'En attente',
            'ANNULEE': 'Annulée'
        };
        return labels[statut] || statut;
    };

    const getStatutClass = (statut) => {
        const classes = {
            'PAYEE': 'payee',
            'EN_ATTENTE': 'en-attente',
            'ANNULEE': 'annulee'
        };
        return classes[statut] || '';
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="factures-loading-container">
                <div className="factures-spinner"></div>
                <p>Chargement des factures...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="factures-error-container">
                <AlertCircle size={48} color="#ef4444" />
                <h3>Erreur de chargement</h3>
                <p>{error}</p>
                <button onClick={fetchFactures} className="factures-btn-retry">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="factures-container">
            <div className="factures-header">
                <div className="factures-header-content">
                    <FileText size={32} />
                    <div>
                        <h1 className="factures-title">Gestion des Factures</h1>
                        <p className="factures-subtitle">Suivi et validation des paiements</p>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="factures-stats-grid">
                <div className="factures-stat-card">
                    <div className="factures-stat-icon blue">
                        <FileText size={24} />
                    </div>
                    <div className="factures-stat-content">
                        <p className="factures-stat-label">Total factures</p>
                        <h3 className="factures-stat-value">{stats.total}</h3>
                    </div>
                </div>

                <div className="factures-stat-card">
                    <div className="factures-stat-icon green">
                        <Check size={24} />
                    </div>
                    <div className="factures-stat-content">
                        <p className="factures-stat-label">Factures payées</p>
                        <h3 className="factures-stat-value">{stats.payees}</h3>
                    </div>
                </div>

                <div className="factures-stat-card">
                    <div className="factures-stat-icon yellow">
                        <Calendar size={24} />
                    </div>
                    <div className="factures-stat-content">
                        <p className="factures-stat-label">En attente</p>
                        <h3 className="factures-stat-value">{stats.enAttente}</h3>
                    </div>
                </div>

                <div className="factures-stat-card">
                    <div className="factures-stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="factures-stat-content">
                        <p className="factures-stat-label">Revenus encaissés</p>
                        <h3 className="factures-stat-value">{stats.montantTotal.toFixed(2)} DH</h3>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="factures-filters-bar">
                <div className="factures-filter-group">
                    <Filter size={20} />
                    <label className="factures-filter-label">Filtrer par statut:</label>
                    <select
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="factures-filter-select"
                    >
                        <option value="TOUTES">Toutes ({factures.length})</option>
                        <option value="EN_ATTENTE">
                            En attente ({factures.filter(f => f.statut === 'EN_ATTENTE').length})
                        </option>
                        <option value="PAYEE">
                            Payées ({factures.filter(f => f.statut === 'PAYEE').length})
                        </option>
                        <option value="ANNULEE">
                            Annulées ({factures.filter(f => f.statut === 'ANNULEE').length})
                        </option>
                    </select>
                </div>
            </div>

            {/* Liste des factures */}
            <div className="factures-table-container">
                {filteredFactures.length === 0 ? (
                    <div className="factures-empty-state">
                        <FileText size={64} color="#d1d5db" />
                        <h3 className="factures-empty-title">Aucune facture trouvée</h3>
                        <p className="factures-empty-text">
                            {filterStatut !== 'TOUTES'
                                ? `Aucune facture avec le statut "${getStatutLabel(filterStatut)}"`
                                : "Les factures s'afficheront ici"}
                        </p>
                    </div>
                ) : (
                    <div className="factures-table-wrapper">
                        <table className="factures-table">
                            <thead>
                            <tr>
                                <th>N° Facture</th>
                                <th>Patient</th>
                                <th>Date émission</th>
                                <th>Montant</th>
                                <th>Mode paiement</th>
                                <th>Statut</th>
                                <th>Date paiement</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredFactures.map(facture => (
                                <tr key={facture.idFacture}>
                                    <td>
                                        <span className="facture-id">#{facture.idFacture}</span>
                                    </td>
                                    <td>
                                        <div className="facture-patient-cell">
                                            <User size={16} />
                                            <span>{facture.nomPatient} {facture.prenomPatient}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td>
                                        <span className="facture-montant">
                                            {parseFloat(facture.montant).toFixed(2)} DH
                                        </span>
                                    </td>
                                    <td>
                                        <span className="facture-mode-paiement">
                                            {facture.modePaiement}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`facture-statut-badge ${getStatutClass(facture.statut)}`}>
                                            {getStatutLabel(facture.statut)}
                                        </span>
                                    </td>
                                    <td>
                                        {facture.datePaiement
                                            ? new Date(facture.datePaiement).toLocaleDateString('fr-FR')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <div className="facture-actions-cell">
                                            {facture.statut === 'EN_ATTENTE' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedFacture(facture);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="facture-btn-action validate"
                                                    title="Valider le paiement"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {facture.statut !== 'ANNULEE' && (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(facture)}
                                                        className="facture-btn-action edit"
                                                        title="Modifier"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleImprimerFacture(facture.idFacture)}
                                                        className="facture-btn-action print"
                                                        title="Imprimer"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnnulerFacture(facture.idFacture)}
                                                        className="facture-btn-action cancel"
                                                        title="Annuler"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal validation paiement */}
            {showPaymentModal && selectedFacture && (
                <div className="factures-modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="factures-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="factures-modal-header">
                            <h3 className="factures-modal-title">Validation du paiement</h3>
                        </div>

                        <div className="factures-modal-body">
                            <div className="factures-modal-info">
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Facture N°:</span>
                                    <span className="factures-info-value">#{selectedFacture.idFacture}</span>
                                </div>
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Patient:</span>
                                    <span className="factures-info-value">
                                        {selectedFacture.nomPatient} {selectedFacture.prenomPatient}
                                    </span>
                                </div>
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Montant:</span>
                                    <span className="factures-info-value" style={{fontWeight: '600', color: '#10b981'}}>
                                        {parseFloat(selectedFacture.montant).toFixed(2)} DH
                                    </span>
                                </div>
                            </div>

                            <div className="factures-form-group">
                                <label className="factures-form-label">Mode de paiement:</label>
                                <select
                                    value={modePaiement}
                                    onChange={(e) => setModePaiement(e.target.value)}
                                    className="factures-form-select"
                                >
                                    <option value="ESPECES">💵 Espèces</option>
                                    <option value="CARTE">💳 Carte bancaire</option>
                                    <option value="CHEQUE">📝 Chèque</option>
                                    <option value="ASSURANCE">🏥 Assurance</option>
                                </select>
                            </div>
                        </div>

                        <div className="factures-modal-footer">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="factures-btn-modal cancel"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleValiderPaiement}
                                className="factures-btn-modal confirm"
                            >
                                <Check size={16} />
                                Valider le paiement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal modification facture */}
            {showEditModal && editingFacture && (
                <div className="factures-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="factures-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="factures-modal-header">
                            <h3 className="factures-modal-title">Modifier la facture</h3>
                        </div>

                        <div className="factures-modal-body">
                            <div className="factures-modal-info">
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Facture N°:</span>
                                    <span className="factures-info-value">#{editingFacture.idFacture}</span>
                                </div>
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Patient:</span>
                                    <span className="factures-info-value">
                                        {editingFacture.nomPatient} {editingFacture.prenomPatient}
                                    </span>
                                </div>
                                <div className="factures-info-row">
                                    <span className="factures-info-label">Statut actuel:</span>
                                    <span className={`facture-statut-badge ${getStatutClass(editingFacture.statut)}`}>
                                        {getStatutLabel(editingFacture.statut)}
                                    </span>
                                </div>
                            </div>

                            <div className="factures-form-group">
                                <label className="factures-form-label">Montant (DH):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editFormData.montant}
                                    onChange={(e) => setEditFormData({...editFormData, montant: e.target.value})}
                                    className="factures-form-select"
                                    required
                                />
                            </div>

                            <div className="factures-form-group">
                                <label className="factures-form-label">Mode de paiement:</label>
                                <select
                                    value={editFormData.modePaiement}
                                    onChange={(e) => setEditFormData({...editFormData, modePaiement: e.target.value})}
                                    className="factures-form-select"
                                >
                                    <option value="ESPECES">💵 Espèces</option>
                                    <option value="CARTE">💳 Carte bancaire</option>
                                    <option value="CHEQUE">📝 Chèque</option>
                                    <option value="ASSURANCE">🏥 Assurance</option>
                                </select>
                            </div>

                            <div className="factures-form-group">
                                <label className="factures-form-label">Date d'émission:</label>
                                <input
                                    type="date"
                                    value={editFormData.dateEmission}
                                    onChange={(e) => setEditFormData({...editFormData, dateEmission: e.target.value})}
                                    className="factures-form-select"
                                    required
                                />
                            </div>
                        </div>

                        <div className="factures-modal-footer">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="factures-btn-modal cancel"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleModifierFacture}
                                className="factures-btn-modal confirm"
                            >
                                <Check size={16} />
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionFactures;