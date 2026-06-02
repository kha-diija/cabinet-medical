package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.PatientEnCours;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientEnCoursRepository extends JpaRepository<PatientEnCours, Integer> {

    List<PatientEnCours> findByMedecinAndActif(Utilisateur medecin, Boolean actif);
}
