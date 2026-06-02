package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CabinetRepository extends JpaRepository<Cabinet, Integer> {

    Optional<Cabinet> findByEmail(String email);

    List<Cabinet> findByActif(Boolean actif);
    Optional<Cabinet> findByNomAndActifTrue(String nom);


    // Recherche par nom exact
    Optional<Cabinet> findByNom(String nom);

    // Recherche par nom partiel (ignore la casse)
    List<Cabinet> findByNomContainingIgnoreCase(String nom);

    List<Cabinet> findByActifTrue();

    Optional<Cabinet> findByNomIgnoreCase(String nomCabinet);
}
