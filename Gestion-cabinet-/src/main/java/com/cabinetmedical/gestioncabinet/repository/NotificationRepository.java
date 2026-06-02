package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Notification;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    /**
     * Récupère les notifications d'un utilisateur filtrées par statut de lecture
     * Si lu = null, récupère toutes les notifications
     */
    List<Notification> findByUtilisateurAndLuOrderByDateNotificationDesc(
            Utilisateur utilisateur, Boolean lu);

    /**
     * ✅ NOUVEAU : Récupère toutes les notifications d'un utilisateur (lues et non lues)
     */
    List<Notification> findByUtilisateurOrderByDateNotificationDesc(Utilisateur utilisateur);

    /**
     * Compte les notifications d'un utilisateur selon leur statut de lecture
     */
    Long countByUtilisateurAndLu(Utilisateur utilisateur, Boolean lu);

    /**
     * Récupère toutes les notifications d'un cabinet
     */
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.cabinet.id = :cabinetId " +
            "ORDER BY n.dateNotification DESC")
    List<Notification> findByCabinetIdOrderByDateNotificationDesc(@Param("cabinetId") Integer cabinetId);
}