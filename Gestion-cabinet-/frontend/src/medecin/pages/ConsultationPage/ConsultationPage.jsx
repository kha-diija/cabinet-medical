import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Clock, User, Stethoscope, Save, X, History, Info } from 'lucide-react';
import consultationService from '../../services/consultationService';
import dashboardService from '../../services/dashboardService';
import ConsultationHistoryModal from '../../components/ConsultationHistoryModal/ConsultationHistoryModal';
import './ConsultationPage.css';

const ConsultationPage = () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null); // Nouvel état pour message info

  const [formData, setFormData] = useState({
    type: 'CONSULTATION',
    dateConsultation: new Date().toISOString().split('T')[0],
    examenClinique: '',
    examenSupplementaire: '',
    diagnostic: '',
    traitement: '',
    observations: ''
  });

  // Charger le patient en cours et le brouillon au montage
  useEffect(() => {
    loadCurrentPatient();
    loadDraft();
  }, []);

  // Sauvegarder automatiquement le brouillon toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPatient) {
        consultationService.saveDraft(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, currentPatient]);

  const loadCurrentPatient = async () => {
    try {
      setLoading(true);
      const dashboard = await dashboardService.getDashboardData();
      
      if (dashboard.currentPatient) {
        setCurrentPatient(dashboard.currentPatient);
        
        // Vérifier si une consultation existe déjà pour le RDV en cours
        checkExistingConsultation();
      } else {
        setError('Aucun patient en cours. Veuillez sélectionner un patient depuis le tableau de bord.');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du patient:', err);
      setError('Erreur lors du chargement du patient en cours');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingConsultation = async () => {
    try {
      // Cette logique dépend de comment vous récupérez le RDV en cours
      // Vous pouvez ajouter un appel API spécifique ou utiliser une logique métier
      // Pour l'instant, on s'appuie sur l'erreur du backend
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
    }
  };

  const loadDraft = () => {
    const draft = consultationService.getDraft();
    if (draft) {
      setFormData(draft);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPatient) {
      setError('Aucun patient sélectionné');
      return;
    }

    setSaving(true);
    setError(null);
    setInfoMessage(null);
    
    try {
      await consultationService.createConsultation(formData);
      setSuccess('Consultation enregistrée avec succès !');
      consultationService.clearDraft();
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        resetForm();
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      
      // ✅ TRAITER SPÉCIFIQUEMENT L'ERREUR DE CONSULTATION EXISTANTE
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement de la consultation';
      
      if (errorMessage.includes('Une consultation existe déjà') || 
          errorMessage.includes('consultation déjà') || 
          errorMessage.includes('existe déjà') ||
          errorMessage.includes('déjà remplie') ||
          err.response?.status === 409) { // 409 Conflict est approprié pour ce cas
        
        setInfoMessage({
          type: 'info',
          title: 'Consultation déjà existante',
          message: 'Une consultation a déjà été créée pour ce rendez-vous. Vous pouvez : Voir l\'historique',
          actions: [
            { 
              text: 'Voir l\'historique', 
              onClick: () => setShowHistory(true),
              primary: true 
            }
            
          ]
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'CONSULTATION',
      dateConsultation: new Date().toISOString().split('T')[0],
      examenClinique: '',
      examenSupplementaire: '',
      diagnostic: '',
      traitement: '',
      observations: ''
    });
    consultationService.clearDraft();
    setInfoMessage(null);
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  if (loading) {
    return (
      <div className="consultation-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="consultation-page">
      <div className="consultation-header">
        <div className="header-left">
          <Stethoscope size={32} />
          <div>
            <h1>Nouvelle Consultation</h1>
            <p className="subtitle">Remplissez les informations de consultation</p>
          </div>
        </div>
        
        {currentPatient && (
          <button 
            className="btn-history"
            onClick={() => setShowHistory(true)}
            type="button"
          >
            <History size={20} />
            Historique
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FileText size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* ✅ NOUVEAU: Message d'information pour consultation existante */}
      {infoMessage && (
        <div className="alert alert-info">
          <div className="info-message-header">
            <Info size={20} />
            <div>
              <strong>{infoMessage.title}</strong>
              <p>{infoMessage.message}</p>
            </div>
          </div>
          {infoMessage.actions && (
            <div className="info-message-actions">
              {infoMessage.actions.map((action, index) => (
                <button
                  key={index}
                  className={`btn ${action.primary ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={action.onClick}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!currentPatient ? (
        <div className="no-patient-card">
          <User size={48} className="no-patient-icon" />
          <h3>Aucun patient en cours</h3>
          <p>Veuillez sélectionner un patient depuis le tableau de bord pour commencer une consultation.</p>
        </div>
      ) : (
        <div className="consultation-content">
          {/* Informations patient */}
          <div className="patient-info-card">
            <div className="patient-info-header">
              <User size={24} />
              <h3>Patient en cours</h3>
              {infoMessage && (
                <span className="consultation-status-badge">
                  <Info size={16} />
                  Consultation déjà effectuée
                </span>
              )}
            </div>
            <div className="patient-info-grid">
              <div className="patient-info-item">
                <span className="label">Nom complet</span>
                <span className="value">{currentPatient.nom} {currentPatient.prenom}</span>
              </div>
              <div className="patient-info-item">
                <span className="label">CIN</span>
                <span className="value">{currentPatient.cin}</span>
              </div>
              <div className="patient-info-item">
                <span className="label">Date de naissance</span>
                <span className="value">
                  {new Date(currentPatient.dateNaissance).toLocaleDateString('fr-FR')}
                  <span className="age-badge">{calculateAge(currentPatient.dateNaissance)}</span>
                </span>
              </div>
              <div className="patient-info-item">
                <span className="label">Téléphone</span>
                <span className="value">{currentPatient.numTel || 'Non renseigné'}</span>
              </div>
            </div>
          </div>

          {/* Formulaire de consultation */}
          <form onSubmit={handleSubmit} className="consultation-form">
            {/* Ajouter un avertissement si consultation existe déjà */}
            {infoMessage && (
              <div className="form-warning">
                <Info size={18} />
                <span>Le formulaire est désactivé car une consultation existe déjà pour ce rendez-vous.</span>
              </div>
            )}

            <div className="form-section">
              <div className="form-section-header">
                <FileText size={20} />
                <h3>Informations générales</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type de consultation *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    disabled={!!infoMessage} // Désactiver si consultation existe
                  >
                    <option value="CONSULTATION">Nouvelle consultation</option>
                    <option value="CONTROLE">Contrôle</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dateConsultation">Date *</label>
                  <input
                    type="date"
                    id="dateConsultation"
                    name="dateConsultation"
                    value={formData.dateConsultation}
                    onChange={handleInputChange}
                    required
                    disabled={!!infoMessage} // Désactiver si consultation existe
                  />
                </div>
              </div>
            </div>





            <div className="form-section">
              <div className="form-section-header">
                <Stethoscope size={20} />
                <h3>Examen clinique</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="examenClinique">Signes vitaux et examen physique</label>
                <textarea
                  id="examenClinique"
                  name="examenClinique"
                  value={formData.examenClinique}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="l’état clinique général du patient et les constatations à l’examen physique."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <FileText size={20} />
                <h3>Examens complémentaires</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="examenSupplementaire">Examens prescrits ou résultats</label>
                <textarea
                  id="examenSupplementaire"
                  name="examenSupplementaire"
                  value={formData.examenSupplementaire}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder=" les examens demandés ou les résultats disponibles."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <AlertCircle size={20} />
                <h3>Diagnostic</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="diagnostic">Diagnostic principal et différentiel</label>
                <textarea
                  id="diagnostic"
                  name="diagnostic"
                  value={formData.diagnostic}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="l’hypothèse diagnostique retenue et, si nécessaire, les diagnostics à considérer."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <FileText size={20} />
                <h3>Traitement</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="traitement">Prescription et recommandations</label>
                <textarea
                  id="traitement"
                  name="traitement"
                  value={formData.traitement}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="la prise en charge thérapeutique et les conseils donnés au patient."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <Clock size={20} />
                <h3>Observations</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="observations">Notes et suivi</label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="les remarques utiles pour le suivi ou l’évolution attendue."
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                <X size={20} />
                Réinitialiser
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving || !!infoMessage} // Désactiver si consultation existe
              >
                <Save size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer la consultation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal historique */}
      {showHistory && currentPatient && (
        <ConsultationHistoryModal
          patientId={currentPatient.id}
          patientName={`${currentPatient.nom} ${currentPatient.prenom}`}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default ConsultationPage;