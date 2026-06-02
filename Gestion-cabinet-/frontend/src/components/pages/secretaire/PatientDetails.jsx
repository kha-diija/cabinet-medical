import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientDetails.css';

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [medecins, setMedecins] = useState([]);
    const [selectedMedecin, setSelectedMedecin] = useState('');

    useEffect(() => {
        fetchPatientDetails();
        fetchMedecins();
    }, [id]);

    const fetchPatientDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/secretaire/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatient(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement des détails du patient');
            setLoading(false);
        }
    };

    const fetchMedecins = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/secretaire/medecins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedecins(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement des médecins', err);
        }
    };

    const handleEnvoyerAuMedecin = async () => {
        if (!selectedMedecin) {
            alert('Veuillez sélectionner un médecin');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `/api/secretaire/patients/${id}/envoyer-medecin/${selectedMedecin}`,
                {},
                { headers: { Authorization: `Bearer ${token}` }}
            );
            alert('Patient envoyé au médecin avec succès');
            setSelectedMedecin('');
        } catch (err) {
            alert('Erreur lors de l\'envoi du patient au médecin');
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!patient) return <div className="error">Patient non trouvé</div>;

    return (
        <div className="patient-details-container">
            <div className="header-section">
                <button className="btn-back" onClick={() => navigate('/secretaire/patients')}>
                    ← Retour
                </button>
                <h1>Détails du Patient</h1>
            </div>

            <div className="patient-info-card">
                <div className="patient-header">
                    <div className="patient-avatar">
                        {patient.sexe === 'HOMME' ? '👨' : '👩'}
                    </div>
                    <div className="patient-name">
                        <h2>{patient.nom} {patient.prenom}</h2>
                        <p className="patient-cin">CIN: {patient.cin}</p>
                    </div>
                </div>

                <div className="patient-details-grid">
                    <div className="detail-item">
                        <span className="label">Date de naissance:</span>
                        <span className="value">{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Âge:</span>
                        <span className="value">{patient.age} ans</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Sexe:</span>
                        <span className="value">{patient.sexe}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Téléphone:</span>
                        <span className="value">{patient.numTel || 'Non renseigné'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">{patient.email || 'Non renseigné'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Mutuelle:</span>
                        <span className="value">{patient.typeMutuelle || 'Aucune'}</span>
                    </div>

                    <div className="detail-item full-width">
                        <span className="label">Adresse:</span>
                        <span className="value">{patient.adresse || 'Non renseignée'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Nombre de consultations:</span>
                        <span className="value">{patient.nombreConsultations}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Dossier médical:</span>
                        <span className="value">{patient.hasDossierMedical ? '✓ Existe' : '✗ Absent'}</span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Date de création:</span>
                        <span className="value">{new Date(patient.dateCreation).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </div>

            <div className="send-to-medecin-card">
                <h3>Envoyer au médecin</h3>
                <div className="send-medecin-form">
                    <select
                        value={selectedMedecin}
                        onChange={(e) => setSelectedMedecin(e.target.value)}
                        className="medecin-select"
                    >
                        <option value="">Sélectionner un médecin</option>
                        {medecins.map(medecin => (
                            <option key={medecin.id} value={medecin.id}>
                                Dr. {medecin.nom} {medecin.prenom}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn-send"
                        onClick={handleEnvoyerAuMedecin}
                        disabled={!selectedMedecin}
                    >
                        Envoyer
                    </button>
                </div>
            </div>

            <div className="action-buttons">
                <button
                    className="btn-edit"
                    onClick={() => navigate(`/secretaire/patients/edit/${id}`)}
                >
                    Modifier
                </button>
            </div>
        </div>
    );
};

export default PatientDetails;