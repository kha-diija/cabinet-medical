package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Ordonnance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdonnanceRepository extends JpaRepository<Ordonnance, Integer> {

    @Query("""
        SELECT o
        FROM Ordonnance o
        LEFT JOIN FETCH o.consultation c
        LEFT JOIN FETCH c.patient p
        LEFT JOIN FETCH c.medecin m
        WHERE o.consultation.idConsultation = :consultationId
        ORDER BY o.date DESC
    """)
    List<Ordonnance> findByConsultationId(@Param("consultationId") Integer consultationId);

    @Query("""
        SELECT o
        FROM Ordonnance o
        LEFT JOIN FETCH o.consultation c
        LEFT JOIN FETCH c.patient p
        LEFT JOIN FETCH c.medecin m
        WHERE o.id = :id
          AND c.medecin.id = :medecinId
    """)
    Optional<Ordonnance> findByIdAndMedecin(
            @Param("id") Integer id,
            @Param("medecinId") Integer medecinId
    );

    @Query("""
        SELECT o
        FROM Ordonnance o
        LEFT JOIN FETCH o.consultation c
        WHERE c.patient.id = :patientId
          AND c.medecin.id = :medecinId
        ORDER BY o.date DESC
    """)
    List<Ordonnance> findByPatientAndMedecin(
            @Param("patientId") Integer patientId,
            @Param("medecinId") Integer medecinId
    );
}