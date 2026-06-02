import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';  // ✅ AJOUTER CETTE LIGNE
import './Dashboard.css';
import { 
  FaUsers, FaStethoscope, FaUserPlus, FaCalendarCheck,
  FaChartLine, FaChartPie, FaChartBar,
  FaUserInjured, FaArrowRight, FaFileMedical, FaClock,
  FaUserMd, FaSpinner, FaCalendarDay,
  FaExclamationTriangle
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaCheckCircle } from 'react-icons/fa';

console.log('🔍 Dashboard component loaded');
console.log('🔍 API URL:', import.meta.env.VITE_API_URL);
console.log('🔍 Token present:', !!localStorage.getItem('token'));
console.log('🔍 User:', localStorage.getItem('user'));

const MedecinDashboard = () => {
    const navigate = useNavigate();  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  // États séparés pour les patients (à partir des données dashboard)
  const [currentPatientState, setCurrentPatientState] = useState(null);
  const [nextPatientState, setNextPatientState] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [Dashboard] Chargement des données...');
      const data = await dashboardService.getDashboardData();
      console.log('📊 [Dashboard] Données chargées:', data);
      
      setDashboardData(data);
      // Mettre à jour les états séparés avec les données du dashboard
      setCurrentPatientState(data.currentPatient || null);
      setNextPatientState(data.nextPatient || null);
      
    } catch (error) {
      console.error('❌ [Dashboard] Erreur:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      } else if (error.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError('Impossible de charger les données du dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const startConsultation = () => {
  if (!currentPatientState) {
    console.warn('⚠️ Aucun patient en cours');
    return;
  }
  
  console.log('👨‍⚕️ Redirection vers consultation du patient:', currentPatientState.id);
  navigate('/medecin/consultations');
  window.scrollTo(0, 0);
};

  const openPatientFile = () => {
  if (!currentPatientState) {
    console.warn('⚠️ Aucun patient en cours');
    return;
  }
  
  console.log('📂 Redirection vers dossier du patient:', currentPatientState.id);
  navigate('/medecin/dossiers');
  window.scrollTo(0, 0);
};

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRME': '#10b981',
      'EN_ATTENTE': '#f59e0b',
      'TERMINE': '#3b82f6',
      'ANNULE': '#ef4444',
      'EN_COURS': '#8b5cf6'
    };
    return colors[status] || '#64748b';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return format(parseISO(`2000-01-01T${timeString}`), 'HH:mm');
    } catch {
      return timeString;
    }
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
    return age;
  };

  

  const handleCompletePatient = async () => {
    if (currentPatientState && window.confirm('Terminer la consultation de ce patient ?')) {
      try {
        console.log('🔄 Terminaison du patient:', currentPatientState.nom, currentPatientState.prenom);
        
        // Appel API
        await dashboardService.completeCurrentPatient();
        console.log('✅ Patient terminé avec succès');
        
        // 1. Mettre à jour immédiatement l'état local
        setCurrentPatientState(null);
        
        // 2. Rafraîchir toutes les données
        await fetchDashboardData();
        
        console.log('✅ Interface mise à jour');
        
      } catch (error) {
        console.error('❌ Erreur lors de la terminaison:', error);
        alert('Erreur: ' + (error.response?.data || error.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="spinner" />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle />
        <h3>Erreur</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle />
        <p>Aucune donnée disponible</p>
        <button onClick={() => window.location.reload()}>Recharger</button>
      </div>
    );
  }

  // Destructurer dashboardData SANS currentPatient et nextPatient (on utilise les états séparés)
  const { 
    stats = {}, 
    consultationTrend = [], 
    todayAppointments = []
  } = dashboardData;

  // Utiliser les états séparés pour les patients
  const currentPatient = currentPatientState;
  const nextPatient = nextPatientState;

  const keyIndicators = [
    { 
      id: 1, 
      title: "Consultations du jour", 
      value: stats?.consultationsToday || 0, 
      icon: <FaUsers />, 
      color: "#4f46e5",
      change: stats?.consultationsChange > 0 ? 
        `+${stats.consultationsChange} vs hier` : 
        stats?.consultationsChange < 0 ? `${stats.consultationsChange} vs hier` : null
    },
    { 
      id: 2, 
      title: "Nouveaux vs Contrôles", 
      value: `${stats?.nouvellesConsultations || 0} / ${stats?.controles || 0}`, 
      icon: <FaStethoscope />, 
      color: "#8b5cf6",
      subtitle: "Nouvelles / Contrôles"
    },
    { 
      id: 3, 
      title: "Nouveaux patients", 
      value: stats?.nouveauxPatients || 0, 
      icon: <FaUserPlus />, 
      color: "#10b981",
      change: stats?.nouveauxPatients > 0 ? 
        `+${stats.nouveauxPatients} cette semaine` : 
        "Aucun nouveau"
    },
    { 
      id: 4, 
      title: "Rendez-vous", 
      value: stats?.totalRendezVous || 0, 
      icon: <FaCalendarCheck />, 
      color: "#f59e0b",
      details: `${stats?.confirmes || 0} confirmés • ${stats?.enAttente || 0} en attente • ${stats?.termines || 0} terminés • ${stats?.annules || 0} annulés`
    }
  ];

  return (
    <div className="dashboard-container">
      {/* En-tête */}
      <div className="dashboard-header">
        <h1>Tableau de Bord Médical</h1>
        <div className="dashboard-subtitle">
          <FaCalendarDay />
          <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
        </div>
      </div>

      {/* Section 1: Indicateurs Clés */}
      <div className="key-indicators-section">
        <h2 className="section-title">
          <FaChartLine /> Indicateurs de Performance
        </h2>
        <div className="key-indicators-grid">
          {keyIndicators.map(indicator => (
            <div key={indicator.id} className="indicator-card">
              <div className="indicator-icon-wrapper" style={{ backgroundColor: indicator.color }}>
                {indicator.icon}
              </div>
              <div className="indicator-content">
                <div className="indicator-title">{indicator.title}</div>
                <div className="indicator-value">{indicator.value}</div>
                {indicator.subtitle && (
                  <div className="indicator-subtitle">{indicator.subtitle}</div>
                )}
                {indicator.change && (
                  <div className={`indicator-change ${indicator.change.includes('+') ? 'positive' : 'negative'}`}>
                    {indicator.change}
                  </div>
                )}
                {indicator.details && (
                  <div className="indicator-details">{indicator.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Graphiques et Rendez-vous */}
      <div className="charts-appointments-section">
        {/* Première ligne: Graphique principal + Rendez-vous */}
        <div className="main-row">
          {/* Graphique Évolution Hebdomadaire - Réduit */}
          <div className="weekly-evolution-chart">
            <div className="chart-card main-chart reduced-chart">
              <div className="chart-header">
                <div className="chart-title">
                  <FaChartLine /> Évolution Hebdomadaire des consultations
                </div>
                <div className="chart-period">7 derniers jours</div>
              </div>
              <div className="line-chart-container">
                {consultationTrend.length > 0 ? (
                  <div className="line-chart">
                    {consultationTrend.map((item, index) => (
                      <div key={index} className="chart-data-point">
                        <div className="chart-bar">
                          <div 
                            className="chart-bar-fill"
                            style={{ 
                              height: `${(item.count / Math.max(...consultationTrend.map(d => d.count), 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                        <div className="chart-label">{item.day}</div>
                        <div className="chart-value">{item.count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">Aucune donnée disponible</div>
                )}
              </div>
            </div>
          </div>

          {/* Rendez-vous du jour - Plus large */}
          <div className="appointments-sidebar wider">
            <div className="appointments-card">
              <div className="card-header">
                <h3><FaCalendarCheck /> Rendez-vous du Jour</h3>
                <div className="appointments-count">
                  <span className="count-badge">{todayAppointments.length}</span>
                  <span className="count-label">RDV</span>
                </div>
              </div>
              
              {todayAppointments.length > 0 ? (
                <div className="appointments-list scrollable-limited">
                  {todayAppointments.map(appointment => (
                    <div key={appointment.idRendezVous} className="appointment-item">
                      <div className="appointment-time">
                        <FaClock />
                        {formatTime(appointment.heureRdv)}
                      </div>
                      <div className="appointment-details">
                        <div className="patient-name">
                          {appointment.patientNom} {appointment.patientPrenom}
                        </div>
                        <div className="appointment-type">
                          <span className="type-badge">{appointment.motif}</span>
                        </div>
                      </div>
                      <div className="appointment-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.statut) }}
                        >
                          {appointment.statut.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="appointment-actions">
                        
                        {appointment.statut === 'EN_ATTENTE' }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaCalendarCheck />
                  <p>Aucun rendez-vous aujourd'hui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Patients */}
      <div className="patients-section">
        <h2 className="section-title">
          <FaUserInjured /> Gestion des Patients
        </h2>
        
        <div className="patients-grid">
          {/* Patient en cours */}
          <div className="current-patient-card">
            <div className="patient-card-header">
              <h3><FaUserInjured /> Patient en Cours</h3>
              {currentPatient && (
                <div className="patient-status">
                  <FaClock /> {currentPatient.waitingTime || 'En attente'}
                </div>
              )}
            </div>
            
            {currentPatient ? (
              <div className="current-patient-content">
                <div className="patient-avatar">
                  <div className="avatar-initials">
                    {currentPatient.nom?.charAt(0)}{currentPatient.prenom?.charAt(0)}
                  </div>
                </div>
                
                
                <div className="patientco-info">
                  <div className="current-patient-name">
                    {currentPatient.nom} {currentPatient.prenom}
                  </div>
                  <div className="patient-details">
                    <div className="detail-row">
                      <span className="detail-label">Âge:</span>
                      <span className="detail-value">{calculateAge(currentPatient.dateNaissance)} ans</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">CIN:</span>
                      <span className="detail-value">{currentPatient.cin}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Téléphone:</span>
                      <span className="detail-value">{currentPatient.numTel}</span>
                    </div>
                    {currentPatient.allergies && (
                      <div className="detail-row">
                        <span className="detail-label">Allergies:</span>
                        <span className="detail-value allergy-warning">
                          {currentPatient.allergies}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="patient-actions">
                 <button 
                  className="btn-action btn-secondary"
                  onClick={openPatientFile}
                  title="Voir le dossier médical du patient en cours"
                >
                  <FaFileMedical /> Dossier
                  </button>
                  <button 
  className="btn-action btn-primary"
  onClick={startConsultation}
  title="Commencer la consultation"
>
  <FaUserMd /> Consulter
</button>
                  <button 
                    className="btn-action btn-success"
                    onClick={handleCompletePatient}
                    disabled={!currentPatient}
                  >
                    <FaCheckCircle /> Terminer
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-patient">
                <FaUserInjured />
                <p>Aucun patient en salle d'attente</p>
              </div>
            )}
          </div>

          {/* Patient suivant */}
          <div className="next-patient-card">
            <div className="patient-card-header">
              <h3><FaArrowRight /> Patient Suivant</h3>
            </div>
            
            {nextPatient ? (
              <div className="next-patient-content">
                <div className="patient-avatar small">
                  <div className="avatar-initials">
                    {nextPatient.nom?.charAt(0)}{nextPatient.prenom?.charAt(0)}
                  </div>
                </div>
                
                <div className="patient-info">
                  <div className="patient-name">
                    {nextPatient.nom} {nextPatient.prenom}
                  </div>
                  <div className="patient-details">
                    <div className="detail-row">
                      <span className="detail-label">Heure RDV:</span>
                      <span className="detail-value appointment-time">
                        <FaClock /> {formatTime(nextPatient.heureRdv)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value type-badge">
                        {nextPatient.motif}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Âge:</span>
                      <span className="detail-value">
                        {calculateAge(nextPatient.dateNaissance)} ans
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-patient">
                <FaArrowRight />
                <p>Aucun patient suivant</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedecinDashboard;