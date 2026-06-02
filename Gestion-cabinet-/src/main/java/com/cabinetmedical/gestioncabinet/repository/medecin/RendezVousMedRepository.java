package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.RendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RendezVousMedRepository extends JpaRepository<RendezVous, Integer> {

    // ========================================
    // MÉTHODES OPTIMISÉES AVEC JOIN FETCH
    // ========================================

    /**
     * ✅ OPTIMISÉ - Trouve tous les rendez-vous d'un médecin pour une date donnée
     * Charge également le patient et son dossier médical en une seule requête
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId AND r.dateRdv = :date " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findByMedecinAndDate(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous d'un médecin entre deux dates
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv BETWEEN :dateDebut AND :dateFin " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findByMedecinAndDateBetween(
            @Param("medecinId") Integer medecinId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous en attente pour un médecin aujourd'hui
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "AND r.statut = 'EN_ATTENTE' " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findTodayEnAttenteByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous confirmés pour un médecin aujourd'hui
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "AND r.statut = 'CONFIRME' " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findTodayConfirmesByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous en cours pour un médecin aujourd'hui
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "AND r.statut = 'EN_COURS' " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findTodayEnCoursByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous annulés pour un médecin aujourd'hui
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "AND r.statut = 'ANNULE' " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findTodayAnnulesByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * ✅ OPTIMISÉ - Trouve les rendez-vous terminés pour un médecin aujourd'hui
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "AND r.statut = 'TERMINE' " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findTodayTerminesByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * ✅ OPTIMISÉ - Trouve tous les rendez-vous d'un patient
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.patient.id = :patientId " +
            "ORDER BY r.dateRdv DESC, r.heureRdv DESC")
    List<RendezVous> findByPatientId(@Param("patientId") Integer patientId);

    /**
     * ✅ OPTIMISÉ - Récupère l'historique des rendez-vous d'un patient avec un médecin
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.patient.id = :patientId " +
            "ORDER BY r.dateRdv DESC, r.heureRdv DESC")
    List<RendezVous> findHistoryByMedecinAndPatient(
            @Param("medecinId") Integer medecinId,
            @Param("patientId") Integer patientId);

    /**
     * ✅ OPTIMISÉ - Recherche de rendez-vous par nom de patient
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND (LOWER(r.patient.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(r.patient.prenom) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "ORDER BY r.dateRdv DESC")
    List<RendezVous> searchByPatientName(
            @Param("medecinId") Integer medecinId,
            @Param("searchTerm") String searchTerm);

    // ========================================
    // MÉTHODES SANS JOIN FETCH (pour les comptages et vérifications)
    // ========================================

    /**
     * Trouve tous les rendez-vous d'un cabinet pour une date
     */
    @Query("SELECT r FROM RendezVous r " +
            "WHERE r.medecin.cabinet.id = :cabinetId " +
            "AND r.dateRdv = :date " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findByCabinetAndDate(
            @Param("cabinetId") Integer cabinetId,
            @Param("date") LocalDate date);

    /**
     * Trouve le prochain rendez-vous d'un médecin
     */
    @Query("SELECT r FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date " +
            "AND r.heureRdv > :heure " +
            "AND r.statut = :statut " +
            "ORDER BY r.heureRdv ASC")
    Optional<RendezVous> findNextByMedecinAndDateAndStatut(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date,
            @Param("heure") LocalTime heure,
            @Param("statut") RendezVous.Statut statut);

    /**
     * Trouve les rendez-vous par statut pour un médecin et une date
     */
    @Query("SELECT r FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date " +
            "AND r.statut = :statut " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findByMedecinAndDateAndStatut(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date,
            @Param("statut") RendezVous.Statut statut);

    /**
     * Vérifie s'il existe un conflit de rendez-vous
     */
    @Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date " +
            "AND r.heureRdv = :heure " +
            "AND r.statut != 'ANNULE'")
    boolean existsConflict(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date,
            @Param("heure") LocalTime heure);

    /**
     * Compte les rendez-vous par statut pour un médecin et une date
     */
    @Query("SELECT COUNT(r) FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date " +
            "AND r.statut = :statut")
    Long countByMedecinAndDateAndStatut(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date,
            @Param("statut") RendezVous.Statut statut);

    /**
     * Compte les rendez-vous d'un médecin pour une date
     */
    @Query("SELECT COUNT(r) FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date")
    Long countByMedecinAndDate(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date);

    /**
     * Statistiques des rendez-vous d'un médecin pour aujourd'hui
     */
    @Query("SELECT r.statut, COUNT(r) FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = CURRENT_DATE " +
            "GROUP BY r.statut")
    List<Object[]> getTodayStatsByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * Vérifie si un patient a déjà un rendez-vous à une date/heure
     */
    @Query("SELECT COUNT(r) > 0 FROM RendezVous r " +
            "WHERE r.patient.id = :patientId " +
            "AND r.dateRdv = :date " +
            "AND r.heureRdv = :heure " +
            "AND r.statut != 'ANNULE'")
    boolean existsPatientConflict(
            @Param("patientId") Integer patientId,
            @Param("date") LocalDate date,
            @Param("heure") LocalTime heure);

    // ========================================
    // MÉTHODES AVEC FINDER (Spring Data JPA)
    // ========================================

    /**
     * Méthodes de recherche par statut (sans date)
     */

    // ========================================
    // MÉTHODES SUPPLÉMENTAIRES
    // ========================================



    /**
     * Trouve les rendez-vous d'un médecin après une date donnée
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv >= :date " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findByMedecinAndDateAfter(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date);

    /**
     * Trouve les rendez-vous à venir d'un médecin avec un statut spécifique
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.statut = :statut " +
            "AND r.dateRdv >= CURRENT_DATE " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findUpcomingByMedecinAndStatut(
            @Param("medecinId") Integer medecinId,
            @Param("statut") RendezVous.Statut statut);

    /**
     * Trouve tous les rendez-vous d'un cabinet entre deux dates
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "WHERE r.medecin.cabinet.id = :cabinetId " +
            "AND r.dateRdv BETWEEN :dateDebut AND :dateFin " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findByCabinetAndDateBetween(
            @Param("cabinetId") Integer cabinetId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin);

    /**
     * Trouve les rendez-vous d'un médecin pour le mois en cours
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH p.dossierMedical " +
            "WHERE r.medecin.id = :medecinId " +
            "AND YEAR(r.dateRdv) = YEAR(CURRENT_DATE) " +
            "AND MONTH(r.dateRdv) = MONTH(CURRENT_DATE) " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findByMedecinCurrentMonth(@Param("medecinId") Integer medecinId);

    /**
     * Trouve les rendez-vous par motif pour un médecin
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.motif = :motif " +
            "AND r.dateRdv >= CURRENT_DATE " +
            "ORDER BY r.dateRdv, r.heureRdv")
    List<RendezVous> findByMedecinAndMotif(
            @Param("medecinId") Integer medecinId,
            @Param("motif") RendezVous.Motif motif);

    /**
     * Trouve les rendez-vous qui ont une consultation associée
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "LEFT JOIN FETCH r.consultation c " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.consultation IS NOT NULL " +
            "ORDER BY r.dateRdv DESC")
    List<RendezVous> findWithConsultationByMedecinId(@Param("medecinId") Integer medecinId);

    /**
     * Trouve les rendez-vous sans consultation associée
     */
    @Query("SELECT DISTINCT r FROM RendezVous r " +
            "LEFT JOIN FETCH r.patient p " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.consultation IS NULL " +
            "AND r.dateRdv < CURRENT_DATE " +
            "ORDER BY r.dateRdv DESC")
    List<RendezVous> findWithoutConsultationByMedecinId(@Param("medecinId") Integer medecinId);

    // ========================================
    // MÉTHODES DEFAULT (utilisant les méthodes optimisées)
    // ========================================

    /**
     * Trouve les rendez-vous du lendemain
     */
    default List<RendezVous> findTomorrowByMedecinId(Integer medecinId) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        return findByMedecinAndDate(medecinId, tomorrow);
    }

    /**
     * Trouve tous les rendez-vous ordonnés (pour premier/dernier)
     */
    @Query("SELECT r FROM RendezVous r " +
            "WHERE r.medecin.id = :medecinId " +
            "AND r.dateRdv = :date " +
            "ORDER BY r.heureRdv")
    List<RendezVous> findAllByMedecinAndDateOrdered(
            @Param("medecinId") Integer medecinId,
            @Param("date") LocalDate date);

    /**
     * Trouve le premier rendez-vous de la journée
     */
    default Optional<RendezVous> findFirstByMedecinAndDate(Integer medecinId, LocalDate date) {
        List<RendezVous> rendezVous = findAllByMedecinAndDateOrdered(medecinId, date);
        return rendezVous.isEmpty() ? Optional.empty() : Optional.of(rendezVous.get(0));
    }

    @Query("""
        SELECT r
        FROM RendezVous r
        LEFT JOIN FETCH r.patient p
        LEFT JOIN FETCH r.medecin m
        WHERE r.medecin.id = :medecinId
          AND r.statut = :statut
        ORDER BY r.dateRdv DESC, r.heureRdv DESC
    """)
    List<RendezVous> findByMedecinIdAndStatut(
            @Param("medecinId") Integer medecinId,
            @Param("statut") RendezVous.Statut statut
    );



    /**
     * Trouve le dernier rendez-vous de la journée
     */
    default Optional<RendezVous> findLastByMedecinAndDate(Integer medecinId, LocalDate date) {
        List<RendezVous> rendezVous = findAllByMedecinAndDateOrdered(medecinId, date);
        return rendezVous.isEmpty() ? Optional.empty() : Optional.of(rendezVous.get(rendezVous.size() - 1));
    }
}