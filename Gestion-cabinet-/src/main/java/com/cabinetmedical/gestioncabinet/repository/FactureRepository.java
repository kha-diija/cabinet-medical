package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Facture;
import com.cabinetmedical.gestioncabinet.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Integer> {

    /**
     * Trouve toutes les factures d'un cabinet
     */
    List<Facture> findByCabinet(Cabinet cabinet);

    /**
     * Trouve toutes les factures d'un patient
     */
    List<Facture> findByPatient(Patient patient);

    /**
     * Trouve les factures par statut
     */
    List<Facture> findByStatut(Facture.Statut statut);

    /**
     * Trouve les factures d'un cabinet par statut
     */
    List<Facture> findByCabinetAndStatut(Cabinet cabinet, Facture.Statut statut);

    /**
     * Trouve les factures émises entre deux dates
     */
    List<Facture> findByDateEmissionBetween(LocalDate dateDebut, LocalDate dateFin);

    /**
     * Trouve les factures d'un cabinet émises entre deux dates
     */
    @Query("SELECT f FROM Facture f WHERE f.cabinet = :cabinet AND f.dateEmission BETWEEN :dateDebut AND :dateFin")
    List<Facture> findByCabinetAndDateEmissionBetween(
            @Param("cabinet") Cabinet cabinet,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    /**
     * Trouve les factures payées entre deux dates
     */
    @Query("SELECT f FROM Facture f WHERE f.cabinet = :cabinet AND f.statut = 'PAYEE' AND f.datePaiement BETWEEN :dateDebut AND :dateFin")
    List<Facture> findFacturesPayeesBetween(
            @Param("cabinet") Cabinet cabinet,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    /**
     * Compte les factures par statut pour un cabinet
     */
    @Query("SELECT COUNT(f) FROM Facture f WHERE f.cabinet = :cabinet AND f.statut = :statut")
    Long countByCabinetAndStatut(
            @Param("cabinet") Cabinet cabinet,
            @Param("statut") Facture.Statut statut
    );

    /**
     * Calcule le montant total des factures payées pour un cabinet
     */
    @Query("SELECT COALESCE(SUM(f.montant), 0) FROM Facture f WHERE f.cabinet = :cabinet AND f.statut = 'PAYEE'")
    Double sumMontantPayeByCabinet(@Param("cabinet") Cabinet cabinet);

    /**
     * Calcule le montant total des factures en attente pour un cabinet
     */
    @Query("SELECT COALESCE(SUM(f.montant), 0) FROM Facture f WHERE f.cabinet = :cabinet AND f.statut = 'EN_ATTENTE'")
    Double sumMontantEnAttenteByCabinet(@Param("cabinet") Cabinet cabinet);

    /**
     * Trouve la facture associée à une consultation
     */
    @Query("SELECT f FROM Facture f WHERE f.consultation.idConsultation = :consultationId")
    Optional<Facture> findByConsultationId(@Param("consultationId") Integer consultationId);

    /**
     * Trouve les dernières factures d'un cabinet (triées par date décroissante)
     */
    @Query("SELECT f FROM Facture f WHERE f.cabinet = :cabinet ORDER BY f.dateEmission DESC")
    List<Facture> findRecentByCabinet(@Param("cabinet") Cabinet cabinet);

    /**
     * Vérifie si une facture existe pour une consultation
     */
    boolean existsByConsultation_IdConsultation(Integer consultationId);

    /**
     * Compte les factures par statut
     */
    long countByStatut(Facture.Statut statut);

    /**
     * Obtient les revenus mensuels agrégés à partir d'une date donnée
     * Retourne une liste d'Object[] où:
     * - [0] = mois (Integer)
     * - [1] = année (Integer)
     * - [2] = total des revenus (BigDecimal ou Double)
     */
    @Query("SELECT MONTH(f.dateEmission), YEAR(f.dateEmission), SUM(f.montant) " +
            "FROM Facture f " +
            "WHERE f.statut = 'PAYEE' AND f.dateEmission >= :startDate " +
            "GROUP BY YEAR(f.dateEmission), MONTH(f.dateEmission) " +
            "ORDER BY YEAR(f.dateEmission) DESC, MONTH(f.dateEmission) DESC")
    List<Object[]> getRevenusMensuels(@Param("startDate") LocalDate startDate);

    /**
     * Alternative : Récupère les revenus d'un mois spécifique
     * Retourne le total des factures payées pour un mois/année donnés
     */
    @Query("SELECT COALESCE(SUM(f.montant), 0) " +
            "FROM Facture f " +
            "WHERE f.statut = 'PAYEE' " +
            "AND YEAR(f.dateEmission) = :year " +
            "AND MONTH(f.dateEmission) = :month")
    BigDecimal getRevenusDuMois(@Param("year") int year, @Param("month") int month);

    /**
     * Obtient les revenus mensuels pour un cabinet spécifique
     */
    @Query("SELECT MONTH(f.dateEmission), YEAR(f.dateEmission), SUM(f.montant) " +
            "FROM Facture f " +
            "WHERE f.cabinet = :cabinet " +
            "AND f.statut = 'PAYEE' " +
            "AND f.dateEmission >= :startDate " +
            "GROUP BY YEAR(f.dateEmission), MONTH(f.dateEmission) " +
            "ORDER BY YEAR(f.dateEmission) DESC, MONTH(f.dateEmission) DESC")
    List<Object[]> getRevenusMensuelsByCabinet(
            @Param("cabinet") Cabinet cabinet,
            @Param("startDate") LocalDate startDate
    );

    /**
     * Récupère les revenus du mois courant
     */
    @Query("SELECT COALESCE(SUM(f.montant), 0) " +
            "FROM Facture f " +
            "WHERE f.statut = 'PAYEE' " +
            "AND YEAR(f.dateEmission) = YEAR(CURRENT_DATE) " +
            "AND MONTH(f.dateEmission) = MONTH(CURRENT_DATE)")
    BigDecimal getRevenusMoisCourant();

    /**
     * Récupère les revenus du mois courant pour un cabinet spécifique
     */
    @Query("SELECT COALESCE(SUM(f.montant), 0) " +
            "FROM Facture f " +
            "WHERE f.cabinet = :cabinet " +
            "AND f.statut = 'PAYEE' " +
            "AND YEAR(f.dateEmission) = YEAR(CURRENT_DATE) " +
            "AND MONTH(f.dateEmission) = MONTH(CURRENT_DATE)")
    BigDecimal getRevenusMoisCourantByCabinet(@Param("cabinet") Cabinet cabinet);
}