import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import './Notifications.css';

const Notifications = () => {
    const [medecins, setMedecins] = useState([]);
    const [medecinSelected, setMedecinSelected] = useState('');
    const [type, setType] = useState('AUTRE');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [notifications, setNotifications] = useState([]);

    // ✅ NOUVEAU : État pour la recherche de patient
    const [searchPatient, setSearchPatient] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientSearch, setShowPatientSearch] = useState(false);

    useEffect(() => {
        loadMedecins();
        loadNotifications();
    }, []);

    // ✅ NOUVEAU : Rechercher les patients
    useEffect(() => {
        if (searchPatient.length >= 2) {
            searchPatients(searchPatient);
        } else {
            setPatients([]);
        }
    }, [searchPatient]);

    // ✅ NOUVEAU : Afficher la recherche patient pour certains types
    useEffect(() => {
        setShowPatientSearch(['PATIENT_EN_COURS', 'NOUVEAU_PATIENT'].includes(type));
        if (!['PATIENT_EN_COURS', 'NOUVEAU_PATIENT'].includes(type)) {
            setSelectedPatient(null);
            setSearchPatient('');
        }
    }, [type]);

    const searchPatients = async (query) => {
        try {
            const data = await apiService.patients.search(query);
            setPatients(data);
        } catch (err) {
            console.error('Erreur recherche patients:', err);
        }
    };

    const loadMedecins = async () => {
        try {
            const data = await apiService.notifications.getMedecinsDuCabinet();
            setMedecins(data);
        } catch (err) {
            console.error('Erreur chargement médecins:', err);
            setError('Impossible de charger la liste des médecins');
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await apiService.notifications.getNotificationsEnvoyees();
            setNotifications(data);
        } catch (err) {
            console.error('Erreur chargement notifications:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!medecinSelected) {
            setError('Veuillez sélectionner un médecin');
            return;
        }

        if (!message.trim()) {
            setError('Veuillez saisir un message');
            return;
        }

        // ✅ NOUVEAU : Validation pour patient en cours
        if (showPatientSearch && !selectedPatient) {
            setError('Veuillez sélectionner un patient pour ce type de notification');
            return;
        }

        setLoading(true);

        try {
            const notificationData = {
                idUtilisateur: parseInt(medecinSelected),
                type: type,
                message: message.trim()
            };

            // ✅ NOUVEAU : Ajouter l'ID du patient si sélectionné
            if (selectedPatient) {
                notificationData.idPatient = selectedPatient.id;
            }

            await apiService.notifications.envoyer(notificationData);

            setSuccess('Notification envoyée avec succès !');
            setMessage('');
            setMedecinSelected('');
            setType('AUTRE');
            setSelectedPatient(null);
            setSearchPatient('');

            loadNotifications();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'envoi de la notification');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeLabel = (type) => {
        const labels = {
            'RAPPEL_RDV': 'Rappel RDV',
            'PATIENT_EN_COURS': 'Patient en cours',
            'NOUVEAU_PATIENT': 'Nouveau patient',
            'AUTRE': 'Autre'
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        const icons = {
            'RAPPEL_RDV': '⏰',
            'PATIENT_EN_COURS': '🏥',
            'NOUVEAU_PATIENT': '👤',
            'AUTRE': '📢'
        };
        return icons[type] || '📬';
    };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1>📢 Notifications</h1>
                <p>Envoyez des notifications aux médecins de votre cabinet</p>
            </div>

            <div className="notifications-content">
                {/* Formulaire d'envoi */}
                <div className="notification-form-card">
                    <h2>✉️ Envoyer une notification</h2>

                    {error && (
                        <div className="alert alert-error">
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            ✅ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="notification-form">
                        <div className="form-group">
                            <label htmlFor="medecin">
                                👨‍⚕️ Destinataire (Médecin) *
                            </label>
                            <select
                                id="medecin"
                                value={medecinSelected}
                                onChange={(e) => setMedecinSelected(e.target.value)}
                                required
                                disabled={loading}
                            >
                                <option value="">-- Sélectionner un médecin --</option>
                                {medecins.map((medecin) => (
                                    <option key={medecin.id} value={medecin.id}>
                                        Dr. {medecin.nom} {medecin.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="type">
                                🏷️ Type de notification *
                            </label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                                disabled={loading}
                            >
                                <option value="RAPPEL_RDV">⏰ Rappel RDV</option>
                                <option value="PATIENT_EN_COURS">🏥 Patient en cours</option>
                                <option value="NOUVEAU_PATIENT">👤 Nouveau patient</option>
                                <option value="AUTRE">📢 Autre</option>
                            </select>
                        </div>

                        {/* ✅ NOUVEAU : Recherche de patient */}
                        {showPatientSearch && (
                            <div className="form-group">
                                <label htmlFor="patient">
                                    🔍 Rechercher le patient *
                                </label>
                                <input
                                    type="text"
                                    id="patient"
                                    value={searchPatient}
                                    onChange={(e) => setSearchPatient(e.target.value)}
                                    placeholder="CIN, Nom ou Prénom du patient..."
                                    disabled={loading}
                                />

                                {selectedPatient && (
                                    <div className="selected-patient">
                                        <div className="patient-info">
                                            <strong>Patient sélectionné :</strong>
                                            <span>{selectedPatient.nom} {selectedPatient.prenom}</span>
                                            <small>CIN: {selectedPatient.cin}</small>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-remove"
                                            onClick={() => {
                                                setSelectedPatient(null);
                                                setSearchPatient('');
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {!selectedPatient && patients.length > 0 && (
                                    <div className="patients-dropdown">
                                        {patients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="patient-item"
                                                onClick={() => {
                                                    setSelectedPatient(patient);
                                                    setSearchPatient('');
                                                    setPatients([]);
                                                }}
                                            >
                                                <strong>{patient.nom} {patient.prenom}</strong>
                                                <small>CIN: {patient.cin}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="message">
                                💬 Message *
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Saisissez votre message..."
                                rows="5"
                                required
                                disabled={loading}
                                maxLength="500"
                            />
                            <small className="char-count">
                                {message.length}/500 caractères
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? '⏳ Envoi en cours...' : '📤 Envoyer la notification'}
                        </button>
                    </form>
                </div>

                {/* Historique des notifications */}
                <div className="notifications-history">
                    <h2>📋 Historique des notifications</h2>

                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <p>Aucune notification envoyée pour le moment</p>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notification-icon">
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="notification-details">
                                        <div className="notification-header-item">
                                            <span className="notification-type">
                                                {getTypeLabel(notif.type)}
                                            </span>
                                            <span className="notification-date">
                                                {formatDate(notif.dateNotification)}
                                            </span>
                                        </div>
                                        <div className="notification-recipient">
                                            → Dr. {notif.destinataire?.nom} {notif.destinataire?.prenom}
                                        </div>

                                        {/* ✅ NOUVEAU : Afficher le patient si présent */}
                                        {notif.patient && (
                                            <div className="notification-patient">
                                                👤 Patient: {notif.patient.nom} {notif.patient.prenom}
                                                <small>(CIN: {notif.patient.cin})</small>
                                            </div>
                                        )}

                                        <div className="notification-message">
                                            {notif.message}
                                        </div>
                                        <div className="notification-status">
                                            {notif.lu ? (
                                                <span className="status-read">✓ Lu</span>
                                            ) : (
                                                <span className="status-unread">○ Non lu</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;