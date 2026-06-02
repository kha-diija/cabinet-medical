package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CabinetmedRepository extends JpaRepository<Cabinet, Integer> { // Changé de Long à Integer

    // Trouver un cabinet par son nom
    Optional<Cabinet> findByNom(String nom);

    // Trouver les cabinets actifs
    List<Cabinet> findByActifTrue();

    // Trouver les cabinets par spécialité
    List<Cabinet> findBySpecialite(String specialite);

    // Rechercher par nom (LIKE)
    @Query("SELECT c FROM Cabinet c WHERE LOWER(c.nom) LIKE LOWER(CONCAT('%', :nom, '%')) AND c.actif = true")
    List<Cabinet> searchByNom(@Param("nom") String nom);

    // Trouver les cabinets avec des médecins
    @Query("SELECT DISTINCT c FROM Cabinet c JOIN c.utilisateurs u WHERE u.role = 'MEDECIN' AND u.actif = true AND c.actif = true")
    List<Cabinet> findCabinetWithMedecins();

    // Compter le nombre de cabinets actifs
    @Query("SELECT COUNT(c) FROM Cabinet c WHERE c.actif = true")
    long countActiveCabinets();

    // Vérifier si un cabinet avec le même nom existe (pour l'unicité)
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cabinet c WHERE LOWER(c.nom) = LOWER(:nom) AND c.id != :excludeId")
    boolean existsByNomIgnoreCaseAndIdNot(@Param("nom") String nom, @Param("excludeId") Integer excludeId);

    // Trouver le cabinet d'un utilisateur
    @Query("SELECT u.cabinet FROM Utilisateur u WHERE u.id = :userId")
    Optional<Cabinet> findByUserId(@Param("userId") Integer userId);

}