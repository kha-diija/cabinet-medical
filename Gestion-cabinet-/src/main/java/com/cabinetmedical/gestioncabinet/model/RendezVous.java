package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "Rendez_Vous", indexes = {
        @Index(name = "idx_date_rdv", columnList = "date_rdv, heure_rdv"),
        @Index(name = "idx_patient", columnList = "id_patient"),
        @Index(name = "idx_medecin", columnList = "id_medecin")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rendez_vous")
    private Integer idRendezVous;

    @Column(name = "date_rdv", nullable = false)
    private LocalDate dateRdv;

    @Column(name = "heure_rdv", nullable = false)
    private LocalTime heureRdv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Motif motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'EN_ATTENTE'")
    private Statut statut = Statut.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", nullable = false,
            foreignKey = @ForeignKey(name = "FK_RendezVous_Patient"))
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", nullable = false,
            foreignKey = @ForeignKey(name = "FK_RendezVous_Medecin"))
    private Utilisateur medecin;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToOne(mappedBy = "rendezVous", cascade = CascadeType.ALL)
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private Consultation consultation;

    public Integer getId() {
        return idRendezVous;
    }

    public LocalDate getDateHeureDebut() {
        return dateRdv;
    }

    public enum Motif {
        CONSULTATION, CONTROLE,URGENCE,SUIVI
    }

    public enum Statut {
        CONFIRME, ANNULE, EN_ATTENTE, TERMINE,EN_COURS
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = Statut.EN_ATTENTE;
        }
    }
}