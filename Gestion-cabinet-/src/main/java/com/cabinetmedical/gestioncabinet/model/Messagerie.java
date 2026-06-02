package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "Messagerie", indexes = {
        @Index(name = "idx_expediteur", columnList = "id_expediteur"),
        @Index(name = "idx_destinataire", columnList = "id_destinataire, lu"),
        @Index(name = "idx_date4", columnList = "date_envoi")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Messagerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String objet;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean lu = false;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_expediteur", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Messagerie_Expediteur"))
    private Utilisateur expediteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinataire", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Messagerie_Destinataire"))
    private Utilisateur destinataire;

    @Column(name = "piece_jointe", length = 255)
    private String pieceJointe;

    @Column(name = "supprime_expediteur", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean supprimeExpediteur = false;

    @Column(name = "supprime_destinataire", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean supprimeDestinataire = false;

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
        if (lu == null) {
            lu = false;
        }
        if (supprimeExpediteur == null) {
            supprimeExpediteur = false;
        }
        if (supprimeDestinataire == null) {
            supprimeDestinataire = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (lu && dateLecture == null) {
            dateLecture = LocalDateTime.now();
        }
    }
}
