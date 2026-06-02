import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaCalendarCheck, FaClock, FaUser, 
  FaStethoscope, FaCalendar, 
  FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight,
  FaBell, FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarDay,
  FaPhone, FaEnvelope, FaInfoCircle, FaBirthdayCake, FaIdCard
} from 'react-icons/fa';
import './RendezVousPage.css';
import { api } from '../../services/authService';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

const RendezVousPage = () => {
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('aujourdhui');
  const [showStats, setShowStats] = useState(true);
  const [showRendezVousList, setShowRendezVousList] = useState(true); // Nouvel état pour la liste
  const [statistics, setStatistics] = useState({
    total: 0,
    confirmes: 0,
    enAttente: 0,
    annules: 0,
    termines: 0
  });

  // Mini calendrier
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Charger les données
  useEffect(() => {
    const loadRendezVous = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint;

        switch(viewMode) {
          case 'aujourdhui': {
            endpoint = `/medecin/rendez-vous/aujourdhui`;
            break;
          }
          default: {
            endpoint = `/medecin/rendez-vous/par-date?date=${format(selectedDate, 'yyyy-MM-dd')}`;
            break;
          }
        }

        const response = await api.get(endpoint);
        setRendezVous(response.data);
        
        // Calculer les statistiques
        const stats = {
          total: response.data.length,
          confirmes: response.data.filter(r => r.statut === 'CONFIRME').length,
          enAttente: response.data.filter(r => r.statut === 'EN_ATTENTE').length,
          annules: response.data.filter(r => r.statut === 'ANNULE').length,
          termines: response.data.filter(r => r.statut === 'TERMINE').length
        };
        setStatistics(stats);
        
      } catch (error) {
        console.error('Erreur chargement rendez-vous:', error);
        setError('Impossible de charger les rendez-vous');
      } finally {
        setLoading(false);
      }
    };

    loadRendezVous();
  }, [selectedDate, viewMode]);

  // Générer le calendrier du mois complet
  useEffect(() => {
    const generateCalendarDays = () => {
      const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
      const endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      const formattedDays = days.map((day, index) => ({
        date: day,
        formatted: format(day, 'd'),
        key: `day-${format(day, 'yyyy-MM-dd')}-${index}`,
        isToday: isToday(day),
        isSelected: isSameDay(day, selectedDate),
        isCurrentMonth: isSameMonth(day, currentMonth),
        hasRendezVous: rendezVous.some(rdv => 
          isSameDay(parseISO(rdv.dateRdv), day)
        )
      }));
      
      setCalendarDays(formattedDays);
    };

    generateCalendarDays();
  }, [currentMonth, selectedDate, rendezVous]);

  const changeDate = (date) => {
    setSelectedDate(date);
    if (viewMode === 'aujourdhui') {
      setViewMode('date');
    }
  };

  const changeStatut = async (idRendezVous, nouveauStatut) => {
    try {
      await api.put(`/medecin/rendez-vous/${idRendezVous}/statut`, {
        statut: nouveauStatut
      });
      
      setRendezVous(prev => prev.map(rdv => 
        rdv.idRendezVous === idRendezVous 
          ? { ...rdv, statut: nouveauStatut }
          : rdv
      ));
    } catch (error) {
      console.error('Erreur changement statut:', error);
      alert('Impossible de changer le statut');
    }
  };

  const marquerPatientArrive = async (idRendezVous) => {
    try {
      await api.put(`/medecin/rendez-vous/${idRendezVous}/patient-arrive`);
      
      setRendezVous(prev => prev.map(rdv => 
        rdv.idRendezVous === idRendezVous 
          ? { ...rdv, patientArrive: true }
          : rdv
      ));
    } catch (error) {
      console.error('Erreur marquage arrivée:', error);
    }
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'CONFIRME': return '#10b981';
      case 'EN_ATTENTE': return '#f59e0b';
      case 'ANNULE': return '#ef4444';
      case 'TERMINE': return '#3b82f6';
      case 'EN_COURS': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return format(parseISO(`2000-01-01T${timeString}`), 'HH:mm');
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="rendez-vous-loading">
        <div className="spinner"></div>
        <p>Chargement des rendez-vous...</p>
      </div>
    );
  }

  return (
    <div className="rendez-vous-page">
      {/* En-tête */}
      <div className="rendez-vous-header">
        <div className="header-left">
          <h1>
            <FaCalendarAlt /> MES RENDEZ-VOUS
          </h1>
          <div className="date-selector">
            <button 
              className={`view-btn ${viewMode === 'aujourdhui' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('aujourdhui');
                setSelectedDate(new Date());
              }}
            >
              <FaCalendarDay /> Aujourd'hui
            </button>
            <button 
              className={`view-btn ${viewMode === 'date' ? 'active' : ''}`}
              onClick={() => setViewMode('date')}
            >
              <FaCalendar /> Par date
            </button>
          </div>
        </div>
      </div>

      {/* Mini Calendrier - Mois complet */}
      <div className="mini-calendrier">
        <div className="calendrier-header">
          <h3>Calendrier du mois</h3>
          <div className="calendrier-nav">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <FaChevronLeft />
            </button>
            <span>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        <div className="calendrier-grid">
          <div className="calendrier-days-header">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
              <div key={`header-${day}-${idx}`} className="day-header">{day}</div>
            ))}
          </div>
          
          <div className="calendrier-days">
            {calendarDays.map((day) => (
              <button
                key={day.key}
                className={`day-cell 
                  ${day.isToday ? 'today' : ''} 
                  ${day.isSelected ? 'selected' : ''} 
                  ${!day.isCurrentMonth ? 'other-month' : ''}
                  ${day.hasRendezVous ? 'has-rdv' : ''}`}
                onClick={() => changeDate(day.date)}
                disabled={!day.isCurrentMonth}
              >
                <div className="day-number">{day.formatted}</div>
                {day.hasRendezVous && <div className="rdv-dot"></div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="rendez-vous-main">
        {/* Liste des rendez-vous - EN HAUT */}
        <div className="rendez-vous-list-section">
          <div className="list-header">
            <h3>
              <FaCalendarCheck /> Rendez-vous du {viewMode === 'aujourdhui' ? 'jour' : format(selectedDate, 'dd/MM/yyyy')}
            </h3>
            
            <div className="list-header-right">
              <div className="list-count">
                {rendezVous.length} RDV
              </div>
              <button 
                className="btn-toggle-list" 
                onClick={() => setShowRendezVousList(!showRendezVousList)}
                title={showRendezVousList ? "Masquer la liste" : "Afficher la liste"}
              >
                {showRendezVousList ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          </div>

          {showRendezVousList && (
            <>
              {rendezVous.length === 0 ? (
                <div className="empty-list">
                  <FaCalendarCheck size={48} />
                  <p>Aucun rendez-vous {viewMode === 'aujourdhui' ? "aujourd'hui" : "pour cette date"}</p>
                </div>
              ) : (
                <div className="rendez-vous-list">
                  {rendezVous.map((rdv) => (
                    <div key={rdv.idRendezVous} className="rendez-vous-card">
                      <div className="rdv-header">
                        <div className="rdv-time-status">
                          <div className="rdv-time">
                            <FaClock />
                            {formatTime(rdv.heureRdv)}
                          </div>
                          <div 
                            className="rdv-status"
                            style={{ backgroundColor: getStatusColor(rdv.statut) }}
                          >
                            {rdv.statut.replace('_', ' ')}
                          </div>
                          {rdv.patientArrive && (
                            <div className="patient-arrived">
                              <FaBell /> Patient arrivé
                            </div>
                          )}
                        </div>
                        
                        <div className="rdv-actions">
                          {rdv.statut === 'CONFIRME' && !rdv.patientArrive && (
                            <button 
                              className="btn-action btn-sm btn-success"
                              onClick={() => marquerPatientArrive(rdv.idRendezVous)}
                              title="Marquer patient arrivé"
                            >
                              <FaCheckCircle /> Arrivé
                            </button>
                          )}
                          
                          <div className="status-dropdown">
                            <select
                              value={rdv.statut}
                              onChange={(e) => changeStatut(rdv.idRendezVous, e.target.value)}
                              className="status-select"
                            >
                              <option value="EN_ATTENTE">En attente</option>
                              <option value="CONFIRME">Confirmé</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="TERMINE">Terminé</option>
                              <option value="ANNULE">Annulé</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="rdv-body">
                        <div className="patient-info">
                          <div className="patient-name">
                            <FaUser />
                            {rdv.patientPrenom} {rdv.patientNom}
                          </div>
                          <div className="patient-details">
                            <div className="detail-item">
                              <FaIdCard />
                              <span className="detail-label">CIN:</span>
                              <span className="detail-value">{rdv.patientCin || 'N/A'}</span>
                            </div>
                            {rdv.age && (
                              <div className="detail-item">
                                <FaBirthdayCake />
                                <span className="detail-label">Âge:</span>
                                <span className="detail-value">{rdv.age} ans</span>
                              </div>
                            )}
                            {rdv.patientTel && (
                              <div className="detail-item">
                                <FaPhone />
                                <span className="detail-value">{rdv.patientTel}</span>
                              </div>
                            )}
                            {rdv.patientEmail && (
                              <div className="detail-item">
                                <FaEnvelope />
                                <span className="detail-value">{rdv.patientEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rdv-info">
                          <div className="info-section">
                            <div className="info-label">
                              <FaStethoscope /> Motif
                            </div>
                            <div className="info-value">{rdv.motif || 'Non spécifié'}</div>
                          </div>
                          
                          {rdv.notes && (
                            <div className="info-section">
                              <div className="info-label">
                                <FaInfoCircle /> Notes
                              </div>
                              <div className="info-value">{rdv.notes}</div>
                            </div>
                          )}
                          
                          {rdv.allergies && (
                            <div className="info-section warning">
                              <div className="info-label">
                                <FaExclamationTriangle /> Allergies
                              </div>
                              <div className="info-value">{rdv.allergies}</div>
                            </div>
                          )}
                          
                          {rdv.derniereVisite && (
                            <div className="info-section">
                              <div className="info-label">
                                <FaCalendarCheck /> Dernière visite
                              </div>
                              <div className="info-value">{rdv.derniereVisite}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistiques - EN BAS */}
        <div className="stats-section">
          <div className="stats-header">
            <h3>📊 Statistiques {viewMode === 'aujourdhui' ? 'du jour' : 'de la date sélectionnée'}</h3>
            <button className="btn-toggle-stats" onClick={() => setShowStats(!showStats)}>
              {showStats ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          
          {showStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total RDV</div>
                <div className="stat-value">{statistics.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Confirmés</div>
                <div className="stat-value" style={{ color: '#10b981' }}>
                  {statistics.confirmes}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">En attente</div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>
                  {statistics.enAttente}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Annulés</div>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  {statistics.annules}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Terminés</div>
                <div className="stat-value" style={{ color: '#3b82f6' }}>
                  {statistics.termines}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RendezVousPage;