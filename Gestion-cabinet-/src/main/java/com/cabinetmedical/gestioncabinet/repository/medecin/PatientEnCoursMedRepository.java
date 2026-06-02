package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.PatientEnCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientEnCoursMedRepository extends JpaRepository<PatientEnCours, Integer> {

    // Chercher un patient en cours pour un médecin donné
    @Query("SELECT p FROM PatientEnCours p WHERE p.patient.id = :patientId AND p.medecin.id = :medecinId AND p.actif = true")
    Optional<PatientEnCours> findByPatientIdAndMedecinIdAndActifTrue(
            @Param("patientId") Integer patientId,
            @Param("medecinId") Integer medecinId);

    // Trouver tous les patients en cours pour un médecin
    @Query("SELECT p FROM PatientEnCours p WHERE p.medecin.id = :medecinId AND p.actif = true")
    List<PatientEnCours> findByMedecinIdAndActifTrue(@Param("medecinId") Integer medecinId);

    // Vérifier si un patient est en cours pour un médecin
    boolean existsByPatientIdAndMedecinIdAndActifTrue(Integer patientId, Integer medecinId);

    // Compter les patients en cours pour un médecin
    long countByMedecinIdAndActifTrue(Integer medecinId);
}