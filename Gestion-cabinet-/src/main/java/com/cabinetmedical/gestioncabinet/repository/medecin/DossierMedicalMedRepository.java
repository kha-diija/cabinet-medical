package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DossierMedicalMedRepository extends JpaRepository<DossierMedical, Integer> {

    @Query("""
        SELECT d
        FROM DossierMedical d
        LEFT JOIN FETCH d.patient p
        WHERE d.patient.id = :patientId
    """)
    Optional<DossierMedical> findByPatientId(@Param("patientId") Integer patientId);

    @Query("""
        SELECT d
        FROM DossierMedical d
        LEFT JOIN FETCH d.patient p
        WHERE d.idDossier = :dossierId
          AND p.cabinet.id = :cabinetId
    """)
    Optional<DossierMedical> findByIdAndCabinetId(
            @Param("dossierId") Integer dossierId,
            @Param("cabinetId") Integer cabinetId
    );

    @Query("""
        SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END
        FROM DossierMedical d
        WHERE d.patient.id = :patientId
    """)
    boolean existsByPatientId(@Param("patientId") Integer patientId);
}