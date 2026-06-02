package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.Notification;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class NotificationDTO {
    private Integer id;
    private String type;
    private String message;
    private boolean lu;
    private String dateNotification; // Changé en String pour formatage
    private LocalDateTime dateNotificationRaw; // Garder aussi le format original
    private Integer rendezVousId;
    private String patientNom;

    public static NotificationDTO fromEntity(Notification notification) {
        if (notification == null) {
            return null;
        }

        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType().name());
        dto.setMessage(notification.getMessage());
        dto.setLu(notification.getLu() != null ? notification.getLu() : false);

        // Formatage de la date pour le frontend
        if (notification.getDateNotification() != null) {
            dto.setDateNotificationRaw(notification.getDateNotification());
            // Format ISO 8601 pour JavaScript
            dto.setDateNotification(notification.getDateNotification().toString());
        }

        if (notification.getRendezVous() != null) {
            dto.setRendezVousId(notification.getRendezVous().getIdRendezVous());
            if (notification.getRendezVous().getPatient() != null) {
                dto.setPatientNom(notification.getRendezVous().getPatient().getNom() + " " +
                        notification.getRendezVous().getPatient().getPrenom());
            }
        }

        return dto;
    }
}