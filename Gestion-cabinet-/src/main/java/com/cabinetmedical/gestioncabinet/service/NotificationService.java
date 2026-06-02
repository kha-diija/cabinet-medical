package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.NotificationDTO;
import com.cabinetmedical.gestioncabinet.model.Notification;
import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.NotificationRepository;
import com.cabinetmedical.gestioncabinet.repository.PatientRepository;
import com.cabinetmedical.gestioncabinet.repository.RendezVousRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PatientRepository patientRepository;
    private final RendezVousRepository rendezVousRepository;

    /**
     * ✅ Créer une notification à partir d'un DTO (utilisé par les secrétaires)
     * Cette méthode gère TOUS les cas : avec ou sans patient, avec ou sans RDV
     */
    @Transactional
    public Notification creerNotification(NotificationDTO dto, Utilisateur secretaire) {
        // Récupérer le destinataire
        Utilisateur destinataire = utilisateurRepository.findById(dto.getIdUtilisateur())
                .orElseThrow(() -> new RuntimeException("Utilisateur destinataire non trouvé"));

        // Vérifier que le destinataire est du même cabinet
        if (!destinataire.getCabinet().getId().equals(secretaire.getCabinet().getId())) {
            throw new RuntimeException("Vous ne pouvez envoyer des notifications qu'aux médecins de votre cabinet");
        }

        // Créer la notification
        Notification notification = new Notification();
        notification.setUtilisateur(destinataire);
        notification.setType(Notification.Type.valueOf(String.valueOf(dto.getType())));
        notification.setMessage(dto.getMessage());
        notification.setLu(false);
        notification.setDateNotification(LocalDateTime.now());

        // ✅ Associer le patient si présent
        if (dto.getIdPatient() != null) {
            Patient patient = patientRepository.findById(dto.getIdPatient())
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            notification.setPatient(patient);
        }
        // Associer le rendez-vous si présent
        if (dto.getIdRendezVous() != null) {
            RendezVous rdv = rendezVousRepository.findById(dto.getIdRendezVous())
                    .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
            notification.setRendezVous(rdv);
        }

        return notificationRepository.save(notification);
    }

    /**
     * ✅ Créer une notification directement (utilisé par les services internes)
     * Version simplifiée pour les notifications automatiques
     */
    @Transactional
    public Notification creerNotificationAutomatique(
            Utilisateur destinataire,
            Notification.Type type,
            String message,
            RendezVous rendezVous
    ) {
        Notification notification = new Notification();
        notification.setUtilisateur(destinataire);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRendezVous(rendezVous);
        notification.setLu(false);
        notification.setDateNotification(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    /**
     * Récupérer toutes les notifications d'un cabinet
     */
    public List<Notification> findBySecrétaire(Integer cabinetId) {
        return notificationRepository.findByCabinetIdOrderByDateNotificationDesc(cabinetId);
    }

    /**
     * Récupérer les notifications NON LUES d'un utilisateur
     */
    public List<Notification> findByUtilisateur(Utilisateur utilisateur) {
        return notificationRepository.findByUtilisateurAndLuOrderByDateNotificationDesc(
                utilisateur, false);
    }

    /**
     * Récupérer toutes les notifications (lues et non lues) d'un utilisateur
     */
    public List<Notification> findAllByUtilisateur(Utilisateur utilisateur) {
        return notificationRepository.findByUtilisateurOrderByDateNotificationDesc(utilisateur);
    }

    /**
     * Compter les notifications non lues d'un utilisateur
     */
    public Long countNotificationsNonLues(Utilisateur utilisateur) {
        return notificationRepository.countByUtilisateurAndLu(utilisateur, false);
    }

    /**
     * Marquer une notification comme lue
     */
    @Transactional
    public void marquerCommeLu(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notification.setLu(true);
        notificationRepository.save(notification);
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    @Transactional
    public void marquerToutesCommeLues(Utilisateur utilisateur) {
        List<Notification> notifications = notificationRepository
                .findByUtilisateurAndLuOrderByDateNotificationDesc(utilisateur, false);
        notifications.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(notifications);
    }

    /**
     * Supprimer une notification
     */
    @Transactional
    public void supprimerNotification(Integer notificationId, Utilisateur utilisateur) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        // Vérifier que la notification appartient bien à l'utilisateur
        if (!notification.getUtilisateur().getId().equals(utilisateur.getId())) {
            throw new RuntimeException("Vous n'avez pas l'autorisation de supprimer cette notification");
        }

        notificationRepository.delete(notification);
    }
}