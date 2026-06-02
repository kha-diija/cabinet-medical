import React, { useState, useEffect } from 'react';
import './GestionRendezVous.css';
import apiService from '../../../services/apiService.js';

const GestionRendezVous = () => {
    const [rendezVous, setRendezVous] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showNewRdvModal, setShowNewRdvModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRdv, setSelectedRdv] = useState(null);

    const [newRdvForm, setNewRdvForm] = useState({
        patientId: '',
        medecinId: '',
        dateRdv: '',
        heureRdv: '',
        motif: '',
        statut: 'EN_ATTENTE'
    });
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);

    useEffect(() => {
        loadRendezVous();
        loadPatients();
        loadMedecins();
    }, []);

    const loadRendezVous = async () => {
        try {
            setLoading(true);
            setError(null);

            let data;
            try {
                data = await apiService.rendezVous.getAll();
            } catch (err) {
                console.warn('getAll failed, trying getDuJour:', err);
                data = await apiService.rendezVous.getDuJour();
            }

            console.log('✅ Rendez-vous chargés:', data);
            setRendezVous(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des rendez-vous');
            console.error('❌ Erreur chargement RDV:', err);
            setRendezVous([]);
        } finally {
            setLoading(false);
        }
    };

    const loadPatients = async () => {
        try {
            const data = await apiService.patients.getAll();
            setPatients(data);
        } catch (err) {
            console.error('❌ Erreur chargement patients:', err);
        }
    };

    const loadMedecins = async () => {
        try {
            const data = await apiService.notifications.getMedecinsDuCabinet();
            setMedecins(data);
        } catch (err) {
            console.error('❌ Erreur chargement médecins:', err);
        }
    };

    // Vérifier si un RDV existe déjà à cette date/heure
    const checkRdvConflict = (dateRdv, heureRdv, medecinId, excludeRdvId = null) => {
        return rendezVous.some(rdv => {
            if (excludeRdvId && rdv.id === excludeRdvId) return false;

            const rdvDate = new Date(rdv.dateHeure);
            const checkDate = new Date(`${dateRdv}T${heureRdv}`);

            return (
                rdvDate.getTime() === checkDate.getTime() &&
                rdv.medecin?.id === parseInt(medecinId) &&
                rdv.statut !== 'ANNULE'
            );
        });
    };

    const handleCreateRdv = async (e) => {
        e.preventDefault();

        try {
            if (!newRdvForm.patientId || !newRdvForm.medecinId || !newRdvForm.dateRdv || !newRdvForm.heureRdv) {
                setError('Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Vérifier conflit
            if (checkRdvConflict(newRdvForm.dateRdv, newRdvForm.heureRdv, newRdvForm.medecinId)) {
                setError('❌ Ce créneau est déjà réservé pour ce médecin. Veuillez choisir une autre date/heure.');
                return;
            }

            await apiService.rendezVous.create(newRdvForm);

            setSuccess('✅ Rendez-vous créé avec succès !');
            setShowNewRdvModal(false);
            setNewRdvForm({
                patientId: '',
                medecinId: '',
                dateRdv: '',
                heureRdv: '',
                motif: '',
                statut: 'EN_ATTENTE'
            });

            await loadRendezVous();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la création du RDV');
        }
    };

    const handleUpdateRdv = async (e) => {
        e.preventDefault();

        try {
            if (!selectedRdv) return;

            // Vérifier conflit (exclure le RDV actuel)
            if (checkRdvConflict(
                selectedRdv.dateRdv,
                selectedRdv.heureRdv,
                selectedRdv.medecinId,
                selectedRdv.id
            )) {
                setError('❌ Ce créneau est déjà réservé pour ce médecin.');
                return;
            }

            await apiService.rendezVous.update(selectedRdv.id, selectedRdv);

            setSuccess('✅ Rendez-vous modifié avec succès !');
            setShowEditModal(false);
            setSelectedRdv(null);

            await loadRendezVous();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification du RDV');
        }
    };

    const handleDeleteRdv = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;

        try {
            await apiService.rendezVous.delete(id);
            setSuccess('✅ Rendez-vous supprimé avec succès !');
            await loadRendezVous();
            setShowDetailsModal(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression du RDV');
        }
    };

    const handleUpdateStatut = async (id, newStatut) => {
        try {
            await apiService.rendezVous.updateStatut(id, newStatut);
            setSuccess(`✅ Statut changé en "${newStatut}" !`);
            await loadRendezVous();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Erreur lors du changement de statut');
        }
    };

    const openDetailsModal = (rdv) => {
        setSelectedRdv(rdv);
        setShowDetailsModal(true);
    };

    const openEditModal = (rdv) => {
        const rdvDate = new Date(rdv.dateHeure);
        setSelectedRdv({
            id: rdv.id,
            patientId: rdv.patient?.id,
            medecinId: rdv.medecin?.id,
            dateRdv: rdvDate.toISOString().split('T')[0],
            heureRdv: rdvDate.toTimeString().split(' ')[0].substring(0, 5),
            motif: rdv.motif || '',
            statut: rdv.statut
        });
        setShowEditModal(true);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

        const days = [];

        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    };

    const getRendezVousForDate = (date) => {
        return rendezVous.filter(rdv => {
            const rdvDate = new Date(rdv.dateHeure);
            return rdvDate.toDateString() === date.toDateString();
        });
    };

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    };

    const getStatutInfo = (statut) => {
        const statuts = {
            'CONFIRME': { label: 'Confirmé', class: 'status-confirme' },
            'EN_ATTENTE': { label: 'En attente', class: 'status-attente' },
            'ANNULE': { label: 'Annulé', class: 'status-annule' },
            'TERMINE': { label: 'Terminé', class: 'status-termine' },
            'EN_COURS': {label:'En Cours', class:'status-cours'}
        };
        return statuts[statut] || { label: statut, class: 'status-default' };
    };

    const days = getDaysInMonth(currentDate);
    const rdvsSelectedDate = getRendezVousForDate(selectedDate);

    return (
        <div className="gestion-rendez-vous">
            <div className="page-header">
                <h1>📅 Gestion des Rendez-vous</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowNewRdvModal(true)}>
                        + Nouveau RDV
                    </button>
                    <button className="btn-refresh" onClick={loadRendezVous} disabled={loading}>
                        🔄 {loading ? 'Chargement...' : 'Actualiser'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span className="alert-icon">⚠️</span>
                    <div>
                        <strong>Erreur</strong>
                        <p>{error}</p>
                    </div>
                    <button className="alert-close" onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span className="alert-icon">✅</span>
                    <div>
                        <strong>Succès</strong>
                        <p>{success}</p>
                    </div>
                    <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            {/* Modal Nouveau RDV */}
            {showNewRdvModal && (
                <div className="modal-overlay" onClick={() => setShowNewRdvModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📅 Nouveau Rendez-vous</h2>
                            <button className="modal-close" onClick={() => setShowNewRdvModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleCreateRdv} className="rdv-form">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select
                                    value={newRdvForm.patientId}
                                    onChange={(e) => setNewRdvForm({...newRdvForm, patientId: e.target.value})}
                                    required
                                >
                                    <option value="">-- Sélectionner un patient --</option>
                                    {patients.map(p => (
                                        <option key={p.id || p.idPatient} value={p.id || p.idPatient}>
                                            {p.nom} {p.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Médecin *</label>
                                <select
                                    value={newRdvForm.medecinId}
                                    onChange={(e) => setNewRdvForm({...newRdvForm, medecinId: e.target.value})}
                                    required
                                >
                                    <option value="">-- Sélectionner un médecin --</option>
                                    {medecins.map(m => (
                                        <option key={m.id || m.idUtilisateur} value={m.id || m.idUtilisateur}>
                                            Dr. {m.nom} {m.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={newRdvForm.dateRdv}
                                        onChange={(e) => setNewRdvForm({...newRdvForm, dateRdv: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Heure *</label>
                                    <input
                                        type="time"
                                        value={newRdvForm.heureRdv}
                                        onChange={(e) => setNewRdvForm({...newRdvForm, heureRdv: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Motif</label>
                                <select
                                    value={newRdvForm.motif}
                                    onChange={(e) => setNewRdvForm({...newRdvForm, motif: e.target.value})}
                                >
                                    <option value="">-- Sélectionner un motif --</option>
                                    <option value="CONSULTATION">Consultation</option>
                                    <option value="CONTROLE">Contrôle</option>
                                    <option value="URGENCE">Urgence</option>
                                    <option value="SUIVI">Suivi</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowNewRdvModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary">
                                    Créer le RDV
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Modifier RDV */}
            {showEditModal && selectedRdv && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✏️ Modifier le Rendez-vous</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleUpdateRdv} className="rdv-form">
                            <div className="form-group">
                                <label>Patient *</label>
                                <select
                                    value={selectedRdv.patientId}
                                    onChange={(e) => setSelectedRdv({...selectedRdv, patientId: e.target.value})}
                                    required
                                >
                                    {patients.map(p => (
                                        <option key={p.id || p.idPatient} value={p.id || p.idPatient}>
                                            {p.nom} {p.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Médecin *</label>
                                <select
                                    value={selectedRdv.medecinId}
                                    onChange={(e) => setSelectedRdv({...selectedRdv, medecinId: e.target.value})}
                                    required
                                >
                                    {medecins.map(m => (
                                        <option key={m.id || m.idUtilisateur} value={m.id || m.idUtilisateur}>
                                            Dr. {m.nom} {m.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input
                                        type="date"
                                        value={selectedRdv.dateRdv}
                                        onChange={(e) => setSelectedRdv({...selectedRdv, dateRdv: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Heure *</label>
                                    <input
                                        type="time"
                                        value={selectedRdv.heureRdv}
                                        onChange={(e) => setSelectedRdv({...selectedRdv, heureRdv: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Motif</label>
                                <select
                                    value={selectedRdv.motif}
                                    onChange={(e) => setSelectedRdv({...selectedRdv, motif: e.target.value})}
                                >
                                    <option value="">-- Sélectionner un motif --</option>
                                    <option value="CONSULTATION">Consultation</option>
                                    <option value="CONTROLE">Contrôle</option>
                                    <option value="URGENCE">Urgence</option>
                                    <option value="SUIVI">Suivi</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Statut</label>
                                <select
                                    value={selectedRdv.statut}
                                    onChange={(e) => setSelectedRdv({...selectedRdv, statut: e.target.value})}
                                >
                                    <option value="EN_ATTENTE">En attente</option>
                                    <option value="CONFIRME">Confirmé</option>
                                    <option value="ANNULE">Annulé</option>
                                    <option value="TERMINE">Terminé</option>
                                    <option value="EN_COURS">En cours</option>

                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Détails RDV */}
            {showDetailsModal && selectedRdv && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Détails du Rendez-vous</h2>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>

                        <div className="rdv-details">
                            <div className="detail-group">
                                <label>📅 Date et Heure</label>
                                <p>{new Date(selectedRdv.dateHeure).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                            </div>

                            <div className="detail-group">
                                <label>👤 Patient</label>
                                <p>{selectedRdv.patient?.nom} {selectedRdv.patient?.prenom}</p>
                                {selectedRdv.patient?.telephone && (
                                    <p className="detail-secondary">📞 {selectedRdv.patient.telephone}</p>
                                )}
                            </div>

                            <div className="detail-group">
                                <label>👨‍⚕️ Médecin</label>
                                <p>Dr. {selectedRdv.medecin?.nom} {selectedRdv.medecin?.prenom}</p>
                            </div>

                            {selectedRdv.motif && (
                                <div className="detail-group">
                                    <label>📝 Motif</label>
                                    <p>{selectedRdv.motif}</p>
                                </div>
                            )}

                            <div className="detail-group">
                                <label>📊 Statut</label>
                                <span className={`rdv-status ${getStatutInfo(selectedRdv.statut).class}`}>
                                    {getStatutInfo(selectedRdv.statut).label}
                                </span>
                            </div>

                            <div className="detail-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        openEditModal(selectedRdv);
                                    }}
                                >
                                    ✏️ Modifier
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteRdv(selectedRdv.id)}
                                >
                                    🗑️ Supprimer
                                </button>
                            </div>

                            {selectedRdv.statut !== 'ANNULE' && (
                                <div className="statut-actions">
                                    <p><strong>Changer le statut :</strong></p>
                                    <div className="statut-buttons">
                                        {selectedRdv.statut !== 'CONFIRME' && (
                                            <button
                                                className="btn-small btn-confirme"
                                                onClick={() => handleUpdateStatut(selectedRdv.id, 'CONFIRME')}
                                            >
                                                ✓ Confirmer
                                            </button>
                                        )}
                                        {selectedRdv.statut !== 'TERMINE' && (
                                            <button
                                                className="btn-small btn-termine"
                                                onClick={() => handleUpdateStatut(selectedRdv.id, 'TERMINE')}
                                            >
                                                ✓ Terminer
                                            </button>
                                        )}
                                        {selectedRdv.statut !== 'EN_COURS' && (
                                            <button
                                                className="btn-small btn-termine"
                                                onClick={() => handleUpdateStatut(selectedRdv.id, 'EN_COURS')}
                                            >
                                                ✓ EN COURS
                                            </button>
                                        )}
                                        <button
                                            className="btn-small btn-annule"
                                            onClick={() => handleUpdateStatut(selectedRdv.id, 'ANNULE')}
                                        >
                                            ✗ Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="calendar-container">
                <div className="calendar-main">
                    <div className="calendar-nav">
                        <button className="nav-btn" onClick={() => changeMonth(-1)}>
                            ← Mois précédent
                        </button>
                        <h2 className="current-month">{formatMonthYear(currentDate)}</h2>
                        <button className="nav-btn" onClick={() => changeMonth(1)}>
                            Mois suivant →
                        </button>
                    </div>

                    <div className="calendar-grid">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                            <div key={day} className="calendar-day-header">{day}</div>
                        ))}

                        {loading ? (
                            <div className="calendar-loading">
                                <div className="spinner"></div>
                                <p>Chargement des rendez-vous...</p>
                            </div>
                        ) : (
                            days.map((day, index) => {
                                const dayRdvs = getRendezVousForDate(day.date);
                                const isToday = day.date.toDateString() === new Date().toDateString();
                                const isSelected = day.date.toDateString() === selectedDate.toDateString();

                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayRdvs.length > 0 ? 'has-rdv' : ''}`}
                                        onClick={() => setSelectedDate(day.date)}
                                    >
                                        <div className="day-number">{day.date.getDate()}</div>
                                        {dayRdvs.length > 0 && (
                                            <div className="day-rdvs">
                                                {dayRdvs.slice(0, 3).map(rdv => (
                                                    <div key={rdv.id} className="rdv-indicator">
                                                        <span className="rdv-time">
                                                            {new Date(rdv.dateHeure).toLocaleTimeString('fr-FR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        <span className="rdv-patient">{rdv.patient?.nom}</span>
                                                    </div>
                                                ))}
                                                {dayRdvs.length > 3 && (
                                                    <div className="rdv-more">+{dayRdvs.length - 3} autre(s)</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="calendar-sidebar">
                    <div className="sidebar-header">
                        <h3>
                            {selectedDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h3>
                    </div>

                    <div className="sidebar-content">
                        {rdvsSelectedDate.length === 0 ? (
                            <div className="no-rdv">
                                <div className="no-rdv-icon">📅</div>
                                <p>Aucun rendez-vous prévu</p>
                            </div>
                        ) : (
                            <div className="rdv-list">
                                {rdvsSelectedDate.map(rdv => {
                                    const statutInfo = getStatutInfo(rdv.statut);
                                    return (
                                        <div key={rdv.id} className="rdv-card">
                                            <div className="rdv-header">
                                                <span className="rdv-time-large">
                                                    🕐 {new Date(rdv.dateHeure).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </span>
                                                <span className={`rdv-status ${statutInfo.class}`}>
                                                    {statutInfo.label}
                                                </span>
                                            </div>

                                            <div className="rdv-patient-info">
                                                <div className="patient-name">
                                                    👤 {rdv.patient?.nom} {rdv.patient?.prenom}
                                                </div>
                                                {rdv.patient?.telephone && (
                                                    <div className="patient-tel">
                                                        📞 {rdv.patient.telephone}
                                                    </div>
                                                )}
                                            </div>

                                            {rdv.motif && (
                                                <div className="rdv-motif">
                                                    <strong>Motif:</strong> {rdv.motif}
                                                </div>
                                            )}

                                            <div className="rdv-actions">
                                                <button
                                                    className="btn-small btn-view"
                                                    onClick={() => openDetailsModal(rdv)}
                                                >
                                                    Voir détails
                                                </button>
                                                <button
                                                    className="btn-small btn-edit"
                                                    onClick={() => openEditModal(rdv)}
                                                >
                                                    Modifier
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="sidebar-stats">
                        <h4>📊 Statistiques</h4>
                        <div className="stat-item">
                            <span>Total ce mois</span>
                            <strong>{rendezVous.length}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Aujourd'hui</span>
                            <strong>{getRendezVousForDate(new Date()).length}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionRendezVous;