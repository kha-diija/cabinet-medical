package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {

    // Filtrer par cabinet
    List<Patient> findByCabinet(Cabinet cabinet);
    Page<Patient> findByCabinet(Cabinet cabinet, Pageable pageable);

    // Recherche par CIN
    Optional<Patient> findByCinAndCabinet(String cin, Cabinet cabinet);
    Optional<Patient> findByCin(String cin);
    Optional<Patient> findById(Integer Id);

    boolean existsByCin(String cin);

    // Recherche par nom
    List<Patient> findByNomContainingIgnoreCaseAndCabinet(String nom, Cabinet cabinet);
    List<Patient> findByNomContainingIgnoreCaseAndPrenomContainingIgnoreCaseAndCabinet(
            String nom, String prenom, Cabinet cabinet);

    /**
     * ✅ NOUVEAU : Recherche globale de patients par CIN, nom ou prénom dans un cabinet
     * Utilisé pour la recherche dans les notifications
     */
    @Query("SELECT p FROM Patient p WHERE p.cabinet.id = :cabinetId " +
            "AND (LOWER(p.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.cin) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Patient> searchPatients(@Param("cabinetId") Integer cabinetId,
                                 @Param("searchTerm") String searchTerm);

    /**
     * Compter les patients d'un cabinet
     */
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.cabinet.id = :cabinetId")
    Long countByCabinet(@Param("cabinetId") Integer cabinetId);
}