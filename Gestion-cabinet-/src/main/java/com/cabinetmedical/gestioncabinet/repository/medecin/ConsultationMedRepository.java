package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationMedRepository extends JpaRepository<Consultation, Integer> {

    @Query("""
        SELECT c
        FROM Consultation c
        LEFT JOIN FETCH c.patient p
        LEFT JOIN FETCH c.medecin m
        LEFT JOIN FETCH c.dossier d
        WHERE c.patient.id = :patientId
          AND c.medecin.id = :medecinId
        ORDER BY c.dateConsultation DESC, c.dateCreation DESC
    """)
    List<Consultation> findByPatientAndMedecin(
            @Param("patientId") Integer patientId,
            @Param("medecinId") Integer medecinId
    );

    // ⚠️ SUPPRIMER CETTE METHODE - Elle appartient à RendezVousRepository
    // @Query("""
    //     SELECT r
    //     FROM RendezVous r
    //     LEFT JOIN FETCH r.patient p
    //     WHERE r.medecin.id = :medecinId
    //       AND r.statut = :statut
    //     ORDER BY r.dateRdv DESC, r.heureRdv DESC
    // """)
    // List<RendezVous> findByMedecinIdAndStatut(
    //     @Param("medecinId") Integer medecinId,
    //     @Param("statut") RendezVous.Statut statut
    // );

    @Query("""
        SELECT c
        FROM Consultation c
        LEFT JOIN FETCH c.patient
        LEFT JOIN FETCH c.medecin
        LEFT JOIN FETCH c.dossier
        WHERE c.idConsultation = :consultationId
          AND c.medecin.id = :medecinId
    """)
    Optional<Consultation> findByIdAndMedecin(
            @Param("consultationId") Integer consultationId,
            @Param("medecinId") Integer medecinId
    );

    @Query("""
        SELECT c
        FROM Consultation c
        WHERE c.rendezVous.idRendezVous = :rendezVousId
    """)
    Optional<Consultation> findByRendezVousId(@Param("rendezVousId") Integer rendezVousId);

    @Query("""
        SELECT COUNT(c)
        FROM Consultation c
        WHERE c.patient.id = :patientId
          AND c.medecin.id = :medecinId
    """)
    Long countByPatientAndMedecin(
            @Param("patientId") Integer patientId,
            @Param("medecinId") Integer medecinId
    );
}