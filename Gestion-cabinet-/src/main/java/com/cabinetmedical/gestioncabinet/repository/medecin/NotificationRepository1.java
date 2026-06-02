package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository1 extends JpaRepository<Notification, Integer> {

    /**
     * Trouve toutes les notifications non lues d'un utilisateur
     */
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :utilisateurId AND n.lu = false ORDER BY n.dateNotification DESC")
    List<Notification> findUnreadByUtilisateurId(@Param("utilisateurId") Integer utilisateurId);

    /**
     * Trouve toutes les notifications d'un utilisateur
     */
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :utilisateurId ORDER BY n.dateNotification DESC")
    List<Notification> findByUtilisateurId(@Param("utilisateurId") Integer utilisateurId);

    /**
     * Compte les notifications non lues d'un utilisateur
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.utilisateur.id = :utilisateurId AND n.lu = false")
    Long countUnreadByUtilisateurId(@Param("utilisateurId") Integer utilisateurId);

    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     */
    @Query("UPDATE Notification n SET n.lu = true WHERE n.utilisateur.id = :utilisateurId AND n.lu = false")
    void markAllAsReadForUtilisateur(@Param("utilisateurId") Integer utilisateurId);
}