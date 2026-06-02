package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Alerte_Admin", indexes = {
        @Index(name = "idx_alerte_type_lu", columnList = "type, lu"),
        @Index(name = "idx_alerte_date", columnList = "date_creation")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AlerteAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeAlerte type;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean lu = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    // ✅ CORRECTION : Ignorer la relation lazy pour éviter ByteBuddyInterceptor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_demande_cabinet",
            foreignKey = @ForeignKey(name = "FK_Alerte_DemandeCabinet"))
    @JsonIgnore // ✅ Ne pas sérialiser cette relation
    private DemandeCreationCabinet demandeCabinet;

    // ✅ AJOUT : Exposer juste l'ID de la demande (optionnel)
    @Column(name = "id_demande_cabinet", insertable = false, updatable = false)
    private Integer demandeCabinetId;

    // Métadonnées additionnelles
    @Column(name = "nom_demandeur", length = 200)
    private String nomDemandeur;

    @Column(name = "email_demandeur", length = 100)
    private String emailDemandeur;

    public enum TypeAlerte {
        NOUVELLE_DEMANDE_CABINET,
        DOCUMENT_MANQUANT,
        DEMANDE_URGENTE,
        AUTRE
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (lu == null) {
            lu = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (lu && dateLecture == null) {
            dateLecture = LocalDateTime.now();
        }
    }
}