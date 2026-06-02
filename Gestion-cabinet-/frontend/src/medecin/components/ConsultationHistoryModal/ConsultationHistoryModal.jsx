import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Stethoscope, AlertCircle, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import consultationService from '../../services/consultationService';
import './ConsultationHistoryModal.css';

const ConsultationHistoryModal = ({ patientId, patientName, onClose }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
  if (!patientId) {
    console.error('Aucun ID de patient fourni');
    setError('Aucun patient sélectionné');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // ✅ Vérifier que patientId est un nombre valide
    console.log('Chargement historique pour patient ID:', patientId, 'Type:', typeof patientId);
    
    const history = await consultationService.getPatientConsultationHistory(patientId);
    
    console.log('Historique reçu:', history);
    setConsultations(Array.isArray(history) ? history : []);
    
  } catch (err) {
    console.error('Erreur chargement historique:', err);
    setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
    setConsultations([]);
  } finally {
    setLoading(false);
  }
};

  const toggleExpand = (consultationId) => {
    setExpandedId(expandedId === consultationId ? null : consultationId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getTypeLabel = (type) => {
    return type === 'CONSULTATION' ? 'Nouvelle consultation' : 'Contrôle';
  };

  const getTypeBadgeClass = (type) => {
    return type === 'CONSULTATION' ? 'badge-consultation' : 'badge-controle';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <FileText size={24} />
            <div>
              <h2>Historique des consultations</h2>
              <p className="modal-subtitle">{patientName}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement de l'historique...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button className="btn-retry" onClick={loadHistory}>
                Réessayer
              </button>
            </div>
          ) : !Array.isArray(consultations) || consultations.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Aucune consultation</h3>
              <p>Ce patient n'a pas encore d'historique de consultations.</p>
            </div>
          ) : (
            <div className="consultations-list">
              {consultations.map((consultation) => (
                <div 
                  key={consultation.idConsultation} 
                  className={`consultation-card ${expandedId === consultation.idConsultation ? 'expanded' : ''}`}
                >
                  <div 
                    className="consultation-card-header"
                    onClick={() => toggleExpand(consultation.idConsultation)}
                  >
                    <div className="consultation-header-left">
                      <div className="consultation-icon">
                        <Stethoscope size={20} />
                      </div>
                      <div className="consultation-header-info">
                        <div className="consultation-date">
                          <Calendar size={16} />
                          <span>{formatDate(consultation.dateConsultation)}</span>
                        </div>
                        <span className={`type-badge ${getTypeBadgeClass(consultation.type)}`}>
                          {getTypeLabel(consultation.type)}
                        </span>
                      </div>
                    </div>
                    
                    <button className="btn-expand">
                      {expandedId === consultation.idConsultation ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>

                  {expandedId === consultation.idConsultation && (
                    <div className="consultation-card-body">
                      {consultation.examenClinique && (
                        <div className="consultation-section">
                          <div className="section-header">
                            <Stethoscope size={18} />
                            <h4>Examen clinique</h4>
                          </div>
                          <p className="section-content">{consultation.examenClinique}</p>
                        </div>
                      )}

                      {consultation.examenSupplementaire && (
                        <div className="consultation-section">
                          <div className="section-header">
                            <FileText size={18} />
                            <h4>Examens complémentaires</h4>
                          </div>
                          <p className="section-content">{consultation.examenSupplementaire}</p>
                        </div>
                      )}

                      {consultation.diagnostic && (
                        <div className="consultation-section">
                          <div className="section-header">
                            <AlertCircle size={18} />
                            <h4>Diagnostic</h4>
                          </div>
                          <p className="section-content">{consultation.diagnostic}</p>
                        </div>
                      )}

                      {consultation.traitement && (
                        <div className="consultation-section">
                          <div className="section-header">
                            <Pill size={18} />
                            <h4>Traitement</h4>
                          </div>
                          <p className="section-content">{consultation.traitement}</p>
                        </div>
                      )}

                      {consultation.observations && (
                        <div className="consultation-section">
                          <div className="section-header">
                            <FileText size={18} />
                            <h4>Observations</h4>
                          </div>
                          <p className="section-content">{consultation.observations}</p>
                        </div>
                      )}

                      {(consultation.medecinNom || consultation.dateCreation) && (
                        <div className="consultation-footer">
                          {consultation.medecinNom && (
                            <span className="consultation-meta">
                              Médecin: Dr. {consultation.medecinNom} {consultation.medecinPrenom}
                            </span>
                          )}
                          {consultation.dateCreation && (
                            <span className="consultation-meta">
                              Enregistré le {new Date(consultation.dateCreation).toLocaleString('fr-FR')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistoryModal;