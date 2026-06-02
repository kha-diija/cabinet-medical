package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Notification", indexes = {
        @Index(name = "idx_utilisateur_lu", columnList = "id_utilisateur, lu"),
        @Index(name = "idx_date5", columnList = "date_notification")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean lu = false;

    @Column(name = "date_notification", nullable = false)
    private LocalDateTime dateNotification = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Notification_Utilisateur"))
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rendez_vous",
            foreignKey = @ForeignKey(name = "FK_Notification_RendezVous"))
    private RendezVous rendezVous;

    public enum Type {
        RAPPEL_RDV, PATIENT_EN_COURS, NOUVEAU_PATIENT, AUTRE
    }

    // Ajouter cette relation dans votre modèle Notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", foreignKey = @ForeignKey(name = "FK_Notification_Patient"))
    private Patient patient;

    @PrePersist
    protected void onCreate() {
        dateNotification = LocalDateTime.now();
        if (lu == null) {
            lu = false;
        }
    }
}

