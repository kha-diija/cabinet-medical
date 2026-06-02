package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface PatientmedRepository extends JpaRepository<Patient, Integer> {

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.cabinet.id = :cabinetId")
    Integer countByCabinetId(@Param("cabinetId") Integer cabinetId);

    @Query("""
        SELECT p
        FROM Patient p
        LEFT JOIN FETCH p.dossierMedical
        WHERE p.id = :patientId
    """)
    Optional<Patient> findByIdWithDossier(@Param("patientId") Integer patientId);

    @Query("SELECT p FROM Patient p WHERE p.cabinet.id = :cabinetId " +
            "AND (LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR p.cin LIKE CONCAT('%', :query, '%')) " +
            "ORDER BY p.nom, p.prenom")
    List<Patient> searchByCabinet(@Param("query") String query,
                                  @Param("cabinetId") Integer cabinetId);

    // REMPLACER la requête par celle-ci dans PatientmedRepository.java

    @Query("SELECT p FROM Patient p WHERE p.cabinet.id = :cabinetId ORDER BY p.nom ASC, p.prenom ASC")
    List<Patient> findByCabinetIdOrderByNomAscPrenomAsc(@Param("cabinetId") Integer cabinetId);
}
