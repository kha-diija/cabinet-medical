package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.model.Notification;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.medecin.NotificationMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationMedService {

    private final NotificationMedRepository notificationMedRepository;
    private final UtilisateurmedRepository utilisateurRepository;

    // Méthodes avec filtre par cabinet
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserIdAndCabinet(Integer userId, Integer cabinetId) {
        return notificationMedRepository.findByUtilisateurIdAndCabinetId(userId, cabinetId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsByUserIdAndCabinet(Integer userId, Integer cabinetId) {
        return notificationMedRepository.findUnreadByUtilisateurIdAndCabinetId(userId, cabinetId);
    }

    @Transactional(readOnly = true)
    public long countUnreadNotificationsByUserIdAndCabinet(Integer userId, Integer cabinetId) {
        return notificationMedRepository.countUnreadByUtilisateurIdAndCabinetId(userId, cabinetId);
    }

    @Transactional
    public void markAllAsReadByUserIdAndCabinet(Integer userId, Integer cabinetId) {
        notificationMedRepository.markAllAsReadByUserIdAndCabinetId(userId, cabinetId);
        log.info("Toutes les notifications de l'utilisateur {} dans le cabinet {} marquées comme lues", userId, cabinetId);
    }

    // Méthodes existantes (sans filtre par cabinet)
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Integer userId) {
        return notificationMedRepository.findByUtilisateurId(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Integer userId) {
        return notificationMedRepository.findUnreadByUtilisateurId(userId);
    }

    @Transactional(readOnly = true)
    public int getUnreadCount(Integer userId) {
        return (int) notificationMedRepository.countUnreadByUtilisateurId(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        notificationMedRepository.markAsRead(notificationId);
        log.info("Notification {} marquée comme lue", notificationId);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        notificationMedRepository.markAllAsRead(userId);
        log.info("Toutes les notifications de l'utilisateur {} marquées comme lues", userId);
    }

    @Transactional
    public Notification createNotification(Integer userId, String message, Notification.Type type) {
        return createNotification(userId, message, type, null);
    }

    @Transactional
    public Notification createNotification(Integer userId, String message, Notification.Type type, RendezVous rendezVous) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + userId));

        Notification notification = new Notification();
        notification.setType(type);
        notification.setMessage(message);
        notification.setLu(false);
        notification.setUtilisateur(utilisateur);
        notification.setRendezVous(rendezVous);

        return notificationMedRepository.save(notification);
    }

    @Transactional
    public void createRappelRendezVous(RendezVous rendezVous) {
        Utilisateur medecin = rendezVous.getMedecin();
        String patientNom = rendezVous.getPatient().getNom() + " " + rendezVous.getPatient().getPrenom();
        String dateRdv = rendezVous.getDateRdv().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String heureRdv = rendezVous.getHeureRdv().toString();

        String message = String.format("Rappel: Rendez-vous avec %s le %s à %s",
                patientNom, dateRdv, heureRdv);

        createNotification(medecin.getId(), message, Notification.Type.RAPPEL_RDV, rendezVous);
    }

    @Transactional
    public void createPatientEnCoursNotification(Integer medecinId, Integer secretaireId, String patientNom) {
        String messageMedecin = String.format("Patient en attente: %s", patientNom);
        createNotification(medecinId, messageMedecin, Notification.Type.PATIENT_EN_COURS);

        String messageSecretaire = String.format("Patient %s envoyé au médecin", patientNom);
        createNotification(secretaireId, messageSecretaire, Notification.Type.PATIENT_EN_COURS);
    }

    @Transactional
    public void createNouveauPatientNotification(Integer medecinId, String patientNom) {
        String message = String.format("Nouveau patient ajouté: %s", patientNom);
        createNotification(medecinId, message, Notification.Type.NOUVEAU_PATIENT);
    }

    @Transactional
    public void createConsultationTermineeNotification(Integer medecinId, String patientNom) {
        String message = String.format("Consultation terminée pour %s", patientNom);
        createNotification(medecinId, message, Notification.Type.AUTRE);
    }

    @Transactional
    public void createOrdonnanceGenereeNotification(Integer medecinId, String patientNom) {
        String message = String.format("Ordonnance générée pour %s", patientNom);
        createNotification(medecinId, message, Notification.Type.AUTRE);
    }

    @Transactional
    public void createMessageNotification(Integer destinataireId, String expediteurNom) {
        String message = String.format("Nouveau message de %s", expediteurNom);
        createNotification(destinataireId, message, Notification.Type.AUTRE);
    }

    @Transactional
    public void cleanOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Notification> oldNotifications = notificationMedRepository.findAll()
                .stream()
                .filter(n -> n.getDateNotification() != null && n.getDateNotification().isBefore(thirtyDaysAgo))
                .toList();

        if (!oldNotifications.isEmpty()) {
            notificationMedRepository.deleteAll(oldNotifications);
            log.info("{} anciennes notifications supprimées", oldNotifications.size());
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getRecentNotifications(Integer userId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return notificationMedRepository.findRecentNotifications(userId, sevenDaysAgo);
    }

    @Transactional
    public void deleteNotification(Integer notificationId) {
        if (notificationMedRepository.existsById(notificationId)) {
            notificationMedRepository.deleteById(notificationId);
            log.info("Notification {} supprimée", notificationId);
        } else {
            log.warn("Tentative de suppression d'une notification inexistante: {}", notificationId);
        }
    }

    @Transactional
    public void deleteAllNotifications(Integer userId) {
        List<Notification> notifications = notificationMedRepository.findByUtilisateurId(userId);
        if (!notifications.isEmpty()) {
            notificationMedRepository.deleteAll(notifications);
            log.info("{} notifications de l'utilisateur {} supprimées", notifications.size(), userId);
        }
    }

    @Transactional
    public void createSystemNotification(Integer userId, String message) {
        createNotification(userId, message, Notification.Type.AUTRE);
    }

    @Transactional
    public void createRendezVousAnnuleNotification(Integer medecinId, String patientNom, LocalDateTime dateRdv) {
        String dateStr = dateRdv.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String message = String.format("Rendez-vous annulé avec %s prévu le %s", patientNom, dateStr);
        createNotification(medecinId, message, Notification.Type.AUTRE);
    }

    @Transactional
    public void createRendezVousConfirmeNotification(Integer medecinId, String patientNom, LocalDateTime dateRdv) {
        String dateStr = dateRdv.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String message = String.format("Rendez-vous confirmé avec %s le %s", patientNom, dateStr);
        createNotification(medecinId, message, Notification.Type.RAPPEL_RDV);
    }


    @Transactional
    public void createFactureGenereeNotification(Integer userId, String patientNom, Double montant) {
        String message = String.format("Facture générée pour %s - Montant: %.2f DH", patientNom, montant);
        createNotification(userId, message, Notification.Type.AUTRE);
    }
}