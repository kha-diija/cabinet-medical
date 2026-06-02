package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Integer> {

    // ==================== MÉTHODES EXISTANTES ====================

    /**
     * Trouver les rendez-vous par date
     */
    List<RendezVous> findByDateRdv(LocalDate date);

    /**
     * Compter les rendez-vous par date
     */
    Long countByDateRdv(LocalDate date);

    /**
     * Vérifier si un médecin a déjà un RDV à une date/heure donnée (statut non annulé)
     */
    boolean existsByMedecinAndDateRdvAndHeureRdvAndStatutNot(
            Utilisateur medecin,
            LocalDate dateRdv,
            LocalTime heureRdv,
            RendezVous.Statut statut
    );

    /**
     * Trouver les RDV d'un médecin pour une date donnée
     */
    List<RendezVous> findByMedecinAndDateRdv(Utilisateur medecin, LocalDate dateRdv);

    /**
     * Trouver tous les RDV d'un patient
     */
    List<RendezVous> findByPatient(Patient patient);

    /**
     * Trouver les RDV actifs d'un médecin à une date (non annulés)
     */

    @Query("SELECT r FROM RendezVous r WHERE r.medecin = :medecin AND r.dateRdv = :date AND r.statut != 'ANNULE'")
    List<RendezVous> findActiveRendezVousByMedecinAndDate(@Param("medecin") Utilisateur medecin, @Param("date") LocalDate date);


    // ==================== NOUVELLES MÉTHODES POUR DASHBOARD ====================

    /**
     * Compter les rendez-vous par jour (pour graphique semaine)
     */
    @Query(value = """
        SELECT 
            DATE(date_rdv) as date,
            COUNT(*) as count
        FROM rendez_vous
        WHERE date_rdv >= :startDate AND date_rdv <= :endDate
        GROUP BY DATE(date_rdv)
        ORDER BY date_rdv
        """, nativeQuery = true)
    List<Object[]> countRdvParJour(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Compter les rendez-vous par statut (pour graphique circulaire)
     */
    @Query("""
        SELECT r.statut as statut, COUNT(r) as count
        FROM RendezVous r
        GROUP BY r.statut
        """)
    List<Object[]> countByStatut();

    /**
     * Trouver les RDV récents (30 derniers jours)
     */
    @Query("""
        SELECT r FROM RendezVous r
        WHERE r.dateRdv >= :startDate
        ORDER BY r.dateRdv DESC, r.heureRdv DESC
        """)
    List<RendezVous> findRecentRdv(@Param("startDate") LocalDate startDate);


}