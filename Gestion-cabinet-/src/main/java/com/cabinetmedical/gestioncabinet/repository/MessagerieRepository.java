package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Messagerie;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagerieRepository extends JpaRepository<Messagerie, Integer> {

    Page<Messagerie> findByDestinataireAndSupprimeDestinataireOrderByDateEnvoiDesc(
            Utilisateur destinataire, Boolean supprime, Pageable pageable);

    Page<Messagerie> findByExpediteurAndSupprimeExpediteurOrderByDateEnvoiDesc(
            Utilisateur expediteur, Boolean supprime, Pageable pageable);

    Long countByDestinataireAndLu(Utilisateur destinataire, Boolean lu);

    @Query("SELECT m FROM Messagerie m WHERE " +
            "(m.expediteur = :user1 AND m.destinataire = :user2) OR " +
            "(m.expediteur = :user2 AND m.destinataire = :user1) " +
            "ORDER BY m.dateEnvoi ASC")
    List<Messagerie> findConversation(@Param("user1") Utilisateur user1,
                                      @Param("user2") Utilisateur user2);
}
