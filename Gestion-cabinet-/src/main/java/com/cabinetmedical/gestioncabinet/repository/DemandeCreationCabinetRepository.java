package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandeCreationCabinetRepository extends JpaRepository<DemandeCreationCabinet, Integer> {

    /**
     * Rechercher toutes les demandes par statut
     */
    List<DemandeCreationCabinet> findByStatut(DemandeCreationCabinet.Statut statut);

    /**
     * Rechercher toutes les demandes en attente
     */
    List<DemandeCreationCabinet> findByStatutOrderByDateDemandeDesc(DemandeCreationCabinet.Statut statut);

    /**
     * Rechercher une demande par email du médecin
     */
    Optional<DemandeCreationCabinet> findByEmailMedecin(String emailMedecin);

    /**
     * Rechercher une demande par login du médecin
     */
    Optional<DemandeCreationCabinet> findByLoginMedecin(String loginMedecin);

    /**
     * Rechercher une demande par CIN du médecin
     */
    Optional<DemandeCreationCabinet> findByCinMedecin(String cinMedecin);

    /**
     * Vérifier si un email médecin existe déjà
     */
    boolean existsByEmailMedecin(String emailMedecin);

    /**
     * Vérifier si un login médecin existe déjà
     */
    boolean existsByLoginMedecin(String loginMedecin);

    /**
     * Vérifier si un CIN médecin existe déjà
     */
    boolean existsByCinMedecin(String cinMedecin);

    /**
     * Rechercher toutes les demandes traitées par un admin
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE d.adminTraitant.id = :idAdmin")
    List<DemandeCreationCabinet> findByAdminTraitant(@Param("idAdmin") Integer idAdmin);

    /**
     * Rechercher les demandes créées dans une période
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE d.dateDemande BETWEEN :dateDebut AND :dateFin ORDER BY d.dateDemande DESC")
    List<DemandeCreationCabinet> findByDateDemandeBetween(
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin
    );

    /**
     * Compter les demandes par statut
     */
    long countByStatut(DemandeCreationCabinet.Statut statut);

    /**
     * Rechercher les demandes avec nom de cabinet contenant un texte
     */
    List<DemandeCreationCabinet> findByNomCabinetContainingIgnoreCase(String nomCabinet);

    /**
     * Rechercher les demandes par spécialité
     */
    List<DemandeCreationCabinet> findBySpecialiteContainingIgnoreCase(String specialite);

    /**
     * Rechercher toutes les demandes non traitées (EN_ATTENTE)
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE d.statut = 'EN_ATTENTE' ORDER BY d.dateDemande ASC")
    List<DemandeCreationCabinet> findDemandesEnAttente();

    /**
     * Rechercher les demandes approuvées
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE d.statut = 'APPROUVEE' ORDER BY d.dateTraitement DESC")
    List<DemandeCreationCabinet> findDemandesApprouvees();

    /**
     * Rechercher les demandes rejetées
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE d.statut = 'REJETEE' ORDER BY d.dateTraitement DESC")
    List<DemandeCreationCabinet> findDemandesRejetees();

    /**
     * Rechercher les demandes par nom et prénom du médecin
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE " +
            "LOWER(d.nomMedecin) LIKE LOWER(CONCAT('%', :nom, '%')) AND " +
            "LOWER(d.prenomMedecin) LIKE LOWER(CONCAT('%', :prenom, '%'))")
    List<DemandeCreationCabinet> findByMedecinNomPrenom(
            @Param("nom") String nom,
            @Param("prenom") String prenom
    );

    /**
     * Rechercher les dernières demandes (limite)
     */
    @Query("SELECT d FROM DemandeCreationCabinet d ORDER BY d.dateDemande DESC")
    List<DemandeCreationCabinet> findTop10ByOrderByDateDemandeDesc();

    /**
     * Statistiques : Nombre total de demandes par statut
     */
    @Query("SELECT d.statut, COUNT(d) FROM DemandeCreationCabinet d GROUP BY d.statut")
    List<Object[]> countDemandesByStatut();

    /**
     * Rechercher les demandes avec documents manquants
     */
    @Query("SELECT d FROM DemandeCreationCabinet d WHERE " +
            "d.documentLicence IS NULL OR " +
            "d.documentDiplome IS NULL OR " +
            "d.documentCinMedecin IS NULL")
    List<DemandeCreationCabinet> findDemandesWithMissingDocuments();

    /**
     * Supprimer les demandes plus anciennes qu'une date donnée et avec un statut spécifique
     */
    @Query("DELETE FROM DemandeCreationCabinet d WHERE d.dateDemande < :date AND d.statut = :statut")
    void deleteOldDemandesByStatut(
            @Param("date") LocalDateTime date,
            @Param("statut") DemandeCreationCabinet.Statut statut
    );
}