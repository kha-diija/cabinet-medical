package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UtilisateurRepositoryAdmin extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByLogin(String login);
    boolean existsByLogin(String login);
    // Récupérer tous les utilisateurs actifs ou inactifs selon le statut
    List<Utilisateur> findByStatut(String statut);

    // Récupérer uniquement les utilisateurs non supprimés (soft delete)
    List<Utilisateur> findByActifTrue();
}
