package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "Consultation", indexes = {
        @Index(name = "idx_patient", columnList = "id_patient"),
        @Index(name = "idx_date", columnList = "date_consultation")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consultation")
    private Integer idConsultation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(name = "date_consultation", nullable = false)
    private LocalDate dateConsultation;

    @Column(name = "examen_clinique", columnDefinition = "TEXT")
    private String examenClinique;

    @Column(name = "examen_supplementaire", columnDefinition = "TEXT")
    private String examenSupplementaire;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(columnDefinition = "TEXT")
    private String traitement;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @OneToOne
    @JoinColumn(name = "id_rendez_vous", unique = true,
            foreignKey = @ForeignKey(name = "FK_Consultation_RendezVous"))
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private RendezVous rendezVous;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Consultation_Patient"))
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Consultation_Medecin"))
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private Utilisateur medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Consultation_Dossier"))
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private DossierMedical dossier;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL)
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private List<Ordonnance> ordonnances;

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL)
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private Facture facture;

    public String getMotif() {
        if (this.type == Type.CONSULTATION) {
            return "Consultation médicale";
        } else if (this.type == Type.CONTROLE) {
            return "Contrôle de suivi";
        }
        return "Motif inconnu";
    }


    public enum Type {
        CONSULTATION, CONTROLE
    }
    public BigDecimal getMontant() {
        // Si une facture est associée, retourne son montant
        if (facture != null) {
            return facture.getMontant();
        }

        // Sinon, retourne un montant par défaut selon le type de consultation
        switch (type) {
            case CONSULTATION:
                return BigDecimal.valueOf(200); // exemple pour une consultation
            case CONTROLE:
                return BigDecimal.valueOf(100); // exemple pour un contrôle
            default:
                return BigDecimal.ZERO;
        }
    }
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (dateConsultation == null) {
            dateConsultation = LocalDate.now();
        }
    }
}

