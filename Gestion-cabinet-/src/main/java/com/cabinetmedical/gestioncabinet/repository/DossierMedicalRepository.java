package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.DossierMedical;
import com.cabinetmedical.gestioncabinet.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Integer> {

    Optional<DossierMedical> findByPatient(Patient patient);

    boolean existsByPatient(Patient patient);
}