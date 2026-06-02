package com.cabinetmedical.gestioncabinet.dto;

import com.cabinetmedical.gestioncabinet.model.Notification;
import lombok.Data;

@Data
public class NotificationDTO {
    private Integer idUtilisateur;
    private Notification.Type type;
    private String message;
    private Integer idPatient; // ✅ NOUVEAU : pour envoyer le patient
    private Integer idRendezVous; // Pour les rappels RDV
}