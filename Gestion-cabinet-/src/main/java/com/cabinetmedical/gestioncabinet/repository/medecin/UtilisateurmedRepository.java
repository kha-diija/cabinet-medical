package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.model.Cabinet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
@Repository
public interface UtilisateurmedRepository extends JpaRepository<Utilisateur, Integer> { // Changé de Long à Integer

    // Trouver un utilisateur par son login
    Optional<Utilisateur> findByLogin(String login);

    //pour les messages
    List<Utilisateur> findByCabinetAndRoleAndActif(
            Cabinet cabinet,
            Utilisateur.Role role,
            Boolean actif
    );

    // Vérifier si un login existe déjà
    boolean existsByLogin(String login);
}