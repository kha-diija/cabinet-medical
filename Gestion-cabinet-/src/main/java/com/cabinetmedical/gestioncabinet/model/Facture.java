package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Facture", indexes = {
        @Index(name = "idx_date2", columnList = "date_emission"),
        @Index(name = "idx_statut", columnList = "statut")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_facture")
    private Integer idFacture;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false, length = 20)
    private ModePaiement modePaiement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Statut statut = Statut.EN_ATTENTE;

    @Column(name = "date_emission", nullable = false)
    private LocalDate dateEmission;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @OneToOne
    @JoinColumn(name = "id_consultation", unique = true,
            foreignKey = @ForeignKey(name = "FK_Facture_Consultation"))
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Facture_Patient"))
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Facture_Cabinet"))
    private Cabinet cabinet;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    public enum ModePaiement {
        ESPECES, CARTE, ASSURANCE, CHEQUE
    }

    public enum Statut {
        PAYEE, EN_ATTENTE, ANNULEE
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (dateEmission == null) {
            dateEmission = LocalDate.now();
        }
        if (statut == null) {
            statut = Statut.EN_ATTENTE;
        }
    }
}