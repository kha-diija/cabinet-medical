import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService.js';
import PatientFormModal from './PatientFormModal.jsx';
import './GestionPatients.css';

const GestionPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        console.log('🔄 Chargement des patients...');
        setLoading(true);
        setError(null);

        try {
            const data = await apiService.patients.getAll();
            console.log('📦 Données reçues:', data);

            if (Array.isArray(data)) {
                setPatients(data);
                console.log(`✅ ${data.length} patients chargés`);
            } else {
                console.warn('⚠️ Les données ne sont pas un tableau:', data);
                setPatients([]);
                setError('Format de données incorrect reçu du serveur');
            }
        } catch (err) {
            console.error('❌ Erreur chargement patients:', err);
            setError(err.message || 'Erreur lors du chargement des patients');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePatient = async (patientData) => {
        try {
            if (editingPatient) {
                await apiService.patients.update(editingPatient.id, patientData);
                console.log('✅ Patient modifié');
                alert('Patient modifié avec succès !');
            } else {
                await apiService.patients.create(patientData);
                console.log('✅ Patient créé');
                alert('Patient créé avec succès !');
            }

            fetchPatients();
            setShowModal(false);
            setEditingPatient(null);
        } catch (err) {
            console.error('❌ Erreur sauvegarde:', err);
            alert(`Erreur: ${err.message}`);
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
            return;
        }

        try {
            await apiService.patients.delete(id);
            console.log('✅ Patient supprimé');
            alert('Patient supprimé avec succès !');
            fetchPatients();
        } catch (err) {
            console.error('❌ Erreur suppression:', err);
            alert(`Erreur: ${err.message}`);
        }
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            fetchPatients();
            return;
        }

        try {
            const data = await apiService.patients.searchByNom(term);
            if (Array.isArray(data)) {
                setPatients(data);
            } else {
                setPatients([]);
            }
        } catch (err) {
            console.error('❌ Erreur recherche:', err);
        }
    };

    const filteredPatients = Array.isArray(patients) ? patients.filter(patient =>
        patient.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cin?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const calculateAge = (dateNaissance) => {
        if (!dateNaissance) return null;
        const today = new Date();
        const birthDate = new Date(dateNaissance);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="gestion-patients">
            <div className="page-header">
                <h1>👥 Gestion des Patients</h1>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingPatient(null);
                        setShowModal(true);
                    }}
                >
                    ➕ Nouveau Patient
                </button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom, prénom ou CIN..."
                    value={searchTerm}
                    onChange={handleSearch}
                    disabled={loading}
                />
            </div>

            {loading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Chargement des patients...</p>
                </div>
            )}

            {error && !loading && (
                <div className="error-banner">
                    <span>⚠️</span>
                    <div>
                        <strong>Erreur</strong>
                        <p>{error}</p>
                    </div>
                    <button onClick={fetchPatients}>Réessayer</button>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="patients-stats">
                        <span>📊 Total: {patients.length} patients</span>
                        {searchTerm && (
                            <span>🔍 Résultats: {filteredPatients.length}</span>
                        )}
                    </div>

                    <div className="patients-grid">
                        {filteredPatients.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">👥</span>
                                <h3>Aucun patient trouvé</h3>
                                <p>
                                    {searchTerm
                                        ? 'Aucun résultat pour votre recherche'
                                        : 'Commencez par ajouter un nouveau patient'}
                                </p>
                                {searchTerm && (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Effacer la recherche
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredPatients.map(patient => (
                                <div key={patient.id} className="patient-card">
                                    <div className="patient-header">
                                        <div className="patient-avatar">
                                            {patient.nom?.charAt(0) || '?'}{patient.prenom?.charAt(0) || '?'}
                                        </div>
                                        <div className="patient-info">
                                            <h3>{patient.nom || 'N/A'} {patient.prenom || 'N/A'}</h3>
                                            <span className="patient-cin">CIN: {patient.cin || 'N/A'}</span>
                                            {patient.groupeSanguin && (
                                                <span className="patient-blood">🩸 {patient.groupeSanguin}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="patient-details">
                                        {patient.telephone && (
                                            <div className="detail-item">
                                                <span className="icon">📞</span>
                                                <span>{patient.telephone}</span>
                                            </div>
                                        )}
                                        {patient.email && (
                                            <div className="detail-item">
                                                <span className="icon">📧</span>
                                                <span>{patient.email}</span>
                                            </div>
                                        )}
                                        {patient.adresse && (
                                            <div className="detail-item">
                                                <span className="icon">📍</span>
                                                <span>{patient.adresse}</span>
                                            </div>
                                        )}
                                        {patient.dateNaissance && (
                                            <div className="detail-item">
                                                <span className="icon">🎂</span>
                                                <span>
                                                    {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
                                                    {' '}({calculateAge(patient.dateNaissance)} ans)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="patient-actions">
                                        <button
                                            className="btn-secondary"
                                            onClick={() => {
                                                setEditingPatient(patient);
                                                setShowModal(true);
                                            }}
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDeletePatient(patient.id)}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {showModal && (
                <PatientFormModal
                    patient={editingPatient}
                    onSave={handleSavePatient}
                    onClose={() => {
                        setShowModal(false);
                        setEditingPatient(null);
                    }}
                />
            )}
        </div>
    );
};

export default GestionPatients;