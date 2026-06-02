package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {

    // ========== MÉTHODES DE BASE ==========

    /**
     * Trouve un utilisateur par son login
     */
    Optional<Utilisateur> findByLogin(String login);

    /**
     * Trouve un utilisateur par son email
     */
    Optional<Utilisateur> findByEmail(String email);

    /**
     * Vérifie si un login existe
     */
    boolean existsByLogin(String login);

    /**
     * Vérifie si un email existe
     */
    boolean existsByEmail(String email);

    /**
     * Trouve tous les utilisateurs actifs
     */
    List<Utilisateur> findByActifTrue();

    /**
     * Trouve tous les utilisateurs inactifs
     */
    List<Utilisateur> findByActifFalse();

    // ========== MÉTHODES PAR RÔLE ==========

    /**
     * Trouve les utilisateurs par rôle
     */
    List<Utilisateur> findByRole(Utilisateur.Role role);

    /**
     * Trouve les utilisateurs actifs par rôle
     */
    List<Utilisateur> findByRoleAndActifTrue(Utilisateur.Role role);

    // ========== MÉTHODES POUR AuthServiceImpl ==========

    /**
     * Trouve un utilisateur par login et rôle
     */
    Optional<Utilisateur> findByLoginAndRole(String login, Utilisateur.Role role);

    /**
     * Trouve un utilisateur par login, rôle et cabinet
     */
    Optional<Utilisateur> findByLoginAndRoleAndCabinetId(String login, Utilisateur.Role role, Integer cabinetId);

    // ========== MÉTHODES POUR MessagerieServiceImpl ==========

    /**
     * Trouve un utilisateur par login et statut actif
     */
    Optional<Utilisateur> findByLoginAndActif(String login, boolean actif);

    /**
     * Trouve le premier utilisateur par rôle et statut actif
     */
    Optional<Utilisateur> findFirstByRoleAndActif(Utilisateur.Role role, boolean actif);

    /**
     * Trouve les utilisateurs par rôle, cabinet et statut actif
     */
    List<Utilisateur> findByRoleAndCabinetAndActif(Utilisateur.Role role, Cabinet cabinet, boolean actif);

    /**
     * Trouve les utilisateurs par rôle et statut actif
     */
    List<Utilisateur> findByRoleAndActif(Utilisateur.Role role, boolean actif);

    // ========== MÉTHODES PAR CABINET ==========

    /**
     * Trouve les utilisateurs par cabinet
     */
    List<Utilisateur> findByCabinetId(Integer cabinetId);

    /**
     * Trouve les utilisateurs d'un cabinet avec un rôle spécifique
     */
    List<Utilisateur> findByCabinetIdAndRole(Integer cabinetId, Utilisateur.Role role);

    /**
     * Trouve les utilisateurs actifs d'un cabinet avec un rôle spécifique
     */
    List<Utilisateur> findByCabinetIdAndRoleAndActifTrue(Integer cabinetId, Utilisateur.Role role);

    // ========== RECHERCHE ==========

    /**
     * Recherche par nom ou prénom (insensible à la casse)
     */
    List<Utilisateur> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom
    );

    /**
     * Recherche avancée d'utilisateurs
     */
    @Query("SELECT u FROM Utilisateur u WHERE " +
            "(LOWER(u.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.login) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:cabinetId IS NULL OR u.cabinet.id = :cabinetId)")
    List<Utilisateur> searchUtilisateurs(
            @Param("searchTerm") String searchTerm,
            @Param("role") Utilisateur.Role role,
            @Param("cabinetId") Integer cabinetId
    );

    // ========== STATISTIQUES ==========

    /**
     * Compte les utilisateurs par rôle
     */
    long countByRole(Utilisateur.Role role);

    /**
     * Compte les utilisateurs actifs
     */
    long countByActifTrue();

    /**
     * Compte les utilisateurs d'un cabinet
     */
    long countByCabinetId(Integer cabinetId);

    /**
     * Compte les médecins d'un cabinet
     */
    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.cabinet.id = :cabinetId AND u.role = 'MEDECIN'")
    long countMedecinsByCabinetId(@Param("cabinetId") Integer cabinetId);

    // ========== REQUÊTES PERSONNALISÉES ==========

    /**
     * Trouve les médecins actifs d'un cabinet
     */
    @Query("SELECT u FROM Utilisateur u WHERE u.cabinet.id = :cabinetId " +
            "AND u.role = 'MEDECIN' AND u.actif = true ORDER BY u.nom, u.prenom")
    List<Utilisateur> findMedecinsActifsByCabinet(@Param("cabinetId") Integer cabinetId);

    /**
     * Trouve les secrétaires d'un cabinet
     */
    @Query("SELECT u FROM Utilisateur u WHERE u.cabinet.id = :cabinetId " +
            "AND u.role = 'SECRETAIRE' ORDER BY u.nom, u.prenom")
    List<Utilisateur> findSecretairesByCabinet(@Param("cabinetId") Integer cabinetId);

    /**
     * Trouve un utilisateur par login et cabinet
     */
    @Query("SELECT u FROM Utilisateur u WHERE u.login = :login AND u.cabinet.id = :cabinetId")
    Optional<Utilisateur> findByLoginAndCabinet(
            @Param("login") String login,
            @Param("cabinetId") Integer cabinetId
    );

    /**
     * Vérifie si un utilisateur existe dans un cabinet spécifique
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END " +
            "FROM Utilisateur u WHERE u.id = :utilisateurId AND u.cabinet.id = :cabinetId")
    boolean existsByIdAndCabinetId(
            @Param("utilisateurId") Integer utilisateurId,
            @Param("cabinetId") Integer cabinetId
    );

    // ========== LOGIN HYBRIDE (LOGIN OU EMAIL) ==========

    /**
     * Trouve un utilisateur par identifiant (login ou email) et rôle
     */
    @Query("SELECT u FROM Utilisateur u WHERE (u.login = :identifiant OR u.email = :identifiant) AND u.role = :role")
    Optional<Utilisateur> findByIdentifiantAndRole(
            @Param("identifiant") String identifiant,
            @Param("role") Utilisateur.Role role
    );

    /**
     * Trouve un utilisateur par identifiant (login ou email), rôle et cabinet
     */
    @Query("SELECT u FROM Utilisateur u WHERE (u.login = :identifiant OR u.email = :identifiant) AND u.role = :role AND u.cabinet.id = :cabinetId")
    Optional<Utilisateur> findByIdentifiantAndRoleAndCabinet(
            @Param("identifiant") String identifiant,
            @Param("role") Utilisateur.Role role,
            @Param("cabinetId") Integer cabinetId
    );
}