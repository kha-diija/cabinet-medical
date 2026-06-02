package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationMedRepository extends JpaRepository<Notification, Integer> {

    // Récupérer les notifications d'un utilisateur
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :userId ORDER BY n.dateNotification DESC")
    List<Notification> findByUtilisateurId(@Param("userId") Integer userId);

    // Récupérer les notifications non lues
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :userId AND n.lu = false ORDER BY n.dateNotification DESC")
    List<Notification> findUnreadByUtilisateurId(@Param("userId") Integer userId);

    // Compter les notifications non lues
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.utilisateur.id = :userId AND n.lu = false")
    long countUnreadByUtilisateurId(@Param("userId") Integer userId);

    // Marquer une notification comme lue
    @Modifying
    @Query("UPDATE Notification n SET n.lu = true WHERE n.id = :id")
    void markAsRead(@Param("id") Integer id);

    // Marquer toutes les notifications comme lues
    @Modifying
    @Query("UPDATE Notification n SET n.lu = true WHERE n.utilisateur.id = :userId")
    void markAllAsRead(@Param("userId") Integer userId);

    // Récupérer les notifications récentes (7 derniers jours)
    @Query("SELECT n FROM Notification n WHERE n.utilisateur.id = :userId AND n.dateNotification >= :date ORDER BY n.dateNotification DESC")
    List<Notification> findRecentNotifications(@Param("userId") Integer userId, @Param("date") LocalDateTime date);

    // ✅ CORRECTION: Utiliser JOIN FETCH explicite pour éviter les problèmes lazy
    @Query("SELECT n FROM Notification n " +
            "JOIN FETCH n.utilisateur u " +
            "WHERE u.id = :userId " +
            "AND u.cabinet.id = :cabinetId " +
            "ORDER BY n.dateNotification DESC")
    List<Notification> findByUtilisateurIdAndCabinetId(@Param("userId") Integer userId,
                                                       @Param("cabinetId") Integer cabinetId);

    // ✅ CORRECTION: Notifications non lues avec JOIN FETCH
    @Query("SELECT n FROM Notification n " +
            "JOIN FETCH n.utilisateur u " +
            "WHERE u.id = :userId " +
            "AND u.cabinet.id = :cabinetId " +
            "AND n.lu = false " +
            "ORDER BY n.dateNotification DESC")
    List<Notification> findUnreadByUtilisateurIdAndCabinetId(@Param("userId") Integer userId,
                                                             @Param("cabinetId") Integer cabinetId);

    // ✅ CORRECTION: Count avec jointure explicite
    @Query("SELECT COUNT(n) FROM Notification n " +
            "JOIN n.utilisateur u " +
            "WHERE u.id = :userId " +
            "AND u.cabinet.id = :cabinetId " +
            "AND n.lu = false")
    long countUnreadByUtilisateurIdAndCabinetId(@Param("userId") Integer userId,
                                                @Param("cabinetId") Integer cabinetId);

    // ✅ CORRECTION: Update avec jointure
    @Modifying
    @Query("UPDATE Notification n SET n.lu = true " +
            "WHERE n.utilisateur.id = :userId " +
            "AND n.utilisateur.id IN (" +
            "  SELECT u.id FROM Utilisateur u WHERE u.cabinet.id = :cabinetId" +
            ") " +
            "AND n.lu = false")
    void markAllAsReadByUserIdAndCabinetId(@Param("userId") Integer userId,
                                           @Param("cabinetId") Integer cabinetId);
}