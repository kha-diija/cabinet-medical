import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar
} from 'react-icons/fa';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import './MiniCalendrier.css';

const MiniCalendrier = ({ 
  selectedDate, 
  onDateSelect, 
  rendezVous = [],
  viewMode = 'month',
  onViewModeChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState([]);

  // Générer les jours du calendrier avec useCallback
  const generateCalendarDays = useCallback(() => {
    let startDate, endDate;
    
    if (viewMode === 'month') {
      startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
      endDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    } else if (viewMode === 'week') {
      startDate = startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
    } else { // day
      startDate = startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
    }

    const daysArray = eachDayOfInterval({ start: startDate, end: endDate });
    
    const formattedDays = daysArray.map(day => {
      const hasRendezVous = rendezVous.some(rdv => {
        try {
          const rdvDate = parseISO(rdv.dateRdv);
          return isSameDay(rdvDate, day);
        } catch {
          return false;
        }
      });
      
      return {
        date: day,
        formatted: format(day, 'd'),
        dayName: format(day, 'E', { locale: fr }).substring(0, 1),
        isToday: isToday(day),
        isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
        isCurrentMonth: isSameMonth(day, currentMonth),
        hasRendezVous
      };
    });
    
    setDays(formattedDays);
  }, [currentMonth, selectedDate, rendezVous, viewMode]);

  // Effet pour générer les jours
  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (onDateSelect) onDateSelect(today);
  };

  const getMonthStats = useCallback(() => {
    const monthRdv = rendezVous.filter(rdv => {
      try {
        const rdvDate = parseISO(rdv.dateRdv);
        return isSameMonth(rdvDate, currentMonth);
      } catch {
        return false;
      }
    });
    
    return {
      total: monthRdv.length,
      confirmes: monthRdv.filter(r => r.statut === 'CONFIRME').length,
      enAttente: monthRdv.filter(r => r.statut === 'EN_ATTENTE').length
    };
  }, [rendezVous, currentMonth]);

  const monthStats = getMonthStats();

  return (
    <div className="mini-calendrier-container">
      {/* En-tête du calendrier */}
      <div className="calendrier-header">
        <div className="header-left">
          <h3>
            <FaCalendarAlt /> Calendrier
          </h3>
          <div className="view-mode-selector">
            <button
              className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('day')}
              title="Jour"
            >
              <FaCalendarDay />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('week')}
              title="Semaine"
            >
              <FaCalendarWeek />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => onViewModeChange && onViewModeChange('month')}
              title="Mois"
            >
              <FaCalendar />
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="month-navigation">
            <button onClick={handlePrevMonth} className="nav-btn">
              <FaChevronLeft />
            </button>
            <h4>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h4>
            <button onClick={handleNextMonth} className="nav-btn">
              <FaChevronRight />
            </button>
          </div>
          <button onClick={handleToday} className="btn-today">
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Statistiques du mois */}
      <div className="month-stats">
        <div className="stat-item">
          <span className="stat-label">Total RDV:</span>
          <span className="stat-value">{monthStats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Confirmés:</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {monthStats.confirmes}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">En attente:</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>
            {monthStats.enAttente}
          </span>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="week-days">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div key={index} className="week-day">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="days-grid">
        {days.map((day, index) => (
          <button
            key={`${day.date.toString()}-${index}`}
            className={`day-cell 
              ${day.isToday ? 'today' : ''} 
              ${day.isSelected ? 'selected' : ''} 
              ${!day.isCurrentMonth ? 'other-month' : ''}
              ${day.hasRendezVous ? 'has-rdv' : ''}`}
            onClick={() => onDateSelect && onDateSelect(day.date)}
            disabled={!day.isCurrentMonth}
          >
            <div className="day-content">
              <div className="day-number">{day.formatted}</div>
              {day.isToday && <div className="today-indicator"></div>}
              {day.hasRendezVous && <div className="rdv-indicator"></div>}
            </div>
          </button>
        ))}
      </div>

      {/* Légende */}
      <div className="calendrier-legend">
        <div className="legend-row">
          <div className="legend-item">
            <div className="legend-dot today"></div>
            <span className="legend-label">Aujourd'hui</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot selected"></div>
            <span className="legend-label">Sélectionné</span>
          </div>
        </div>
        <div className="legend-row">
          <div className="legend-item">
            <div className="legend-dot has-rdv"></div>
            <span className="legend-label">Avec RDV</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot other-month"></div>
            <span className="legend-label">Autre mois</span>
          </div>
        </div>
      </div>

      {/* Rendez-vous du jour sélectionné */}
      {selectedDate && (
        <div className="selected-day-rdv">
          <h4>RDV du {format(selectedDate, 'dd/MM/yyyy')}</h4>
          <div className="rdv-list">
            {rendezVous
              .filter(rdv => {
                try {
                  const rdvDate = parseISO(rdv.dateRdv);
                  return isSameDay(rdvDate, selectedDate);
                } catch {
                  return false;
                }
              })
              .map((rdv, index) => (
                <div key={`${rdv.idRendezVous || index}-${index}`} className="rdv-item">
                  <div className="rdv-time">
                    {rdv.heureRdv?.substring(0, 5)}
                  </div>
                  <div className="rdv-patient">
                    {rdv.patientPrenom} {rdv.patientNom}
                  </div>
                  <div 
                    className="rdv-status"
                    style={{ 
                      backgroundColor: rdv.statut === 'CONFIRME' ? '#10b981' : 
                                     rdv.statut === 'EN_ATTENTE' ? '#f59e0b' : 
                                     rdv.statut === 'ANNULE' ? '#ef4444' : '#3b82f6'
                    }}
                  >
                    {rdv.statut?.charAt(0)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCalendrier;