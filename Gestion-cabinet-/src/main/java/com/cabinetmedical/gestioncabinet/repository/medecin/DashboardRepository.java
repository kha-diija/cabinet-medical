package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<RendezVous, Integer> {

    // ========== NOUVEAUX PATIENTS (7 derniers jours) ==========
    @Query("""
        SELECT COUNT(DISTINCT p)
        FROM Patient p
        WHERE p.cabinet.id = :cabinetId
          AND p.dateCreation >= :startDate
    """)
    Integer countNewPatientsThisWeek(@Param("cabinetId") Integer cabinetId,
                                     @Param("startDate") LocalDateTime startDate);

    // ========== STATISTIQUES GÉNÉRALES ==========

    @Query("""
        SELECT COUNT(c)
        FROM Consultation c
        WHERE c.medecin.id = :medecinId
          AND c.dateConsultation = :date
    """)
    Integer countConsultationsByMedecinAndDate(@Param("medecinId") Integer medecinId,
                                               @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(c)
        FROM Consultation c
        WHERE c.medecin.id = :medecinId
          AND c.type = 'CONSULTATION'
          AND c.dateConsultation = :date
    """)
    Integer countNouvellesConsultations(@Param("medecinId") Integer medecinId,
                                        @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(c)
        FROM Consultation c
        WHERE c.medecin.id = :medecinId
          AND c.type = 'CONTROLE'
          AND c.dateConsultation = :date
    """)
    Integer countControles(@Param("medecinId") Integer medecinId,
                           @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
          AND r.dateRdv = :date
    """)
    Integer countRendezVousByMedecinAndDate(@Param("medecinId") Integer medecinId,
                                            @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
          AND r.statut = 'CONFIRME'
          AND r.dateRdv = :date
    """)
    Integer countConfirmes(@Param("medecinId") Integer medecinId,
                           @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
          AND r.statut = 'EN_ATTENTE'
          AND r.dateRdv = :date
    """)
    Integer countEnAttente(@Param("medecinId") Integer medecinId,
                           @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
          AND r.statut = 'TERMINE'
          AND r.dateRdv = :date
    """)
    Integer countTermines(@Param("medecinId") Integer medecinId,
                          @Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r)
        FROM RendezVous r
        WHERE r.medecin.id = :medecinId
          AND r.statut = 'ANNULE'
          AND r.dateRdv = :date
    """)
    Integer countAnnules(@Param("medecinId") Integer medecinId,
                         @Param("date") LocalDate date);

    // ========== ÉVOLUTION & GRAPHIQUES ==========

    @Query("""
        SELECT c.type, COUNT(c)
        FROM Consultation c
        WHERE c.medecin.id = :medecinId
          AND c.dateConsultation = :today
        GROUP BY c.type
    """)
    List<Object[]> getConsultationTypes(@Param("medecinId") Integer medecinId,
                                        @Param("today") LocalDate today);

    @Query("""
        SELECT o.contenu, COUNT(o)
        FROM Ordonnance o
        JOIN o.consultation c
        WHERE c.medecin.id = :medecinId
          AND c.dateConsultation = :today
          AND o.type = 'EXAMENS'
        GROUP BY o.contenu
    """)
    List<Object[]> getExamStats(@Param("medecinId") Integer medecinId,
                                @Param("today") LocalDate today);

    // ========== RENDEZ-VOUS ==========

    @Query("""
        SELECT r
        FROM RendezVous r
        JOIN FETCH r.patient
        WHERE r.medecin.id = :medecinId
          AND r.dateRdv = :today
        ORDER BY r.heureRdv
    """)
    List<RendezVous> getTodayAppointments(@Param("medecinId") Integer medecinId,
                                          @Param("today") LocalDate today);

    @Query("""
        SELECT n
        FROM Notification n
        WHERE n.utilisateur.id = :medecinId
          AND n.lu = false
        ORDER BY n.dateNotification DESC
    """)
    List<Notification> getUnreadNotifications(@Param("medecinId") Integer medecinId);

    @Query("""
    SELECT r
    FROM RendezVous r
    JOIN FETCH r.patient
    WHERE r.medecin.id = :medecinId
      AND r.statut = 'EN_COURS'
      AND r.dateRdv = :date
    ORDER BY r.heureRdv ASC
""")
    List<RendezVous> getCurrentPatients(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date
    );



    @Query("""
        SELECT r
        FROM RendezVous r
        JOIN FETCH r.patient
        WHERE r.medecin.id = :medecinId
          AND r.dateRdv = :today
          AND r.statut = 'EN_ATTENTE'
          AND r.heureRdv > :currentTime
        ORDER BY r.heureRdv ASC
    """)
    List<RendezVous> getNextPatient(@Param("medecinId") Integer medecinId,
                                    @Param("today") LocalDate today,
                                    @Param("currentTime") LocalTime currentTime);

    @Query("""
    SELECT r
    FROM RendezVous r
    JOIN FETCH r.patient
    WHERE r.medecin.id = :medecinId
      AND r.dateRdv = :date
      AND r.statut = 'EN_COURS'  
    ORDER BY r.heureRdv ASC
""")
    List<RendezVous> findRendezVousEnCours(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date
    );

    // Méthode utilitaire pour chercher par statut
    @Query("""
    SELECT r
    FROM RendezVous r
    JOIN FETCH r.patient
    WHERE r.medecin.id = :medecinId
      AND r.dateRdv = :date
      AND r.statut = :statut
    ORDER BY r.heureRdv ASC
""")
    List<RendezVous> findRendezVousByStatut(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date,
            @Param("statut") RendezVous.Statut statut
    );

    // ========== TENDANCE HEBDOMADAIRE ==========
    @Query("""
    SELECT r
    FROM RendezVous r
    JOIN FETCH r.patient p
    WHERE r.medecin.id = :medecinId
      AND p.cin = :cin
      AND r.dateRdv = :date
      AND r.statut IN ('EN_ATTENTE', 'CONFIRME')
    ORDER BY r.heureRdv DESC
""")
    List<RendezVous> findRendezVousByPatientCin(
            @Param("medecinId") Integer medecinId,
            @Param("cin") String cin,
            @Param("date") LocalDate date
    );


    @Query(value = """
WITH last_7_days AS (
    SELECT CURRENT_DATE - s AS day_date
    FROM generate_series(0, 6) s
),
consultation_counts AS (
    SELECT 
        CAST(c.date_consultation AS DATE) AS consultation_date,
        COUNT(*) AS consultation_count
    FROM consultation c
    WHERE c.id_medecin = :medecinId
      AND c.date_consultation >= CURRENT_DATE - 6
      AND c.date_consultation <= CURRENT_DATE
    GROUP BY CAST(c.date_consultation AS DATE)
)
SELECT 
    TO_CHAR(d.day_date, 'Dy') AS day_name,
    COALESCE(cc.consultation_count, 0) AS count,
    d.day_date AS date
FROM last_7_days d
LEFT JOIN consultation_counts cc ON cc.consultation_date = d.day_date
ORDER BY d.day_date
""", nativeQuery = true)
    List<Object[]> getWeeklyTrend(@Param("medecinId") Integer medecinId);
}
