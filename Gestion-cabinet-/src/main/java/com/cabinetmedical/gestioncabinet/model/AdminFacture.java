package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "AdminFacture", indexes = {
        @Index(name = "idx_date", columnList = "date_creation"),
        @Index(name = "idx_statut", columnList = "statut")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_facture")
    private Integer idFacture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet", nullable = false,
            foreignKey = @ForeignKey(name = "FK_AdminFacture_Cabinet"))
    @JsonBackReference  // <- ajoute cette annotation ici
    private Cabinet cabinet;

    @Column(nullable = true, precision = 10, scale = 2)
    private BigDecimal montant; // à remplir manuellement

    @Column(nullable = true, length = 50)
    private String periode; // ex : "Décembre 2025" - saisi manuellement

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'EN_ATTENTE'")
    private Statut statut = Statut.EN_ATTENTE; // payé ou en attente

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now(); // automatique

    @Column(name = "date_paiement")
    private LocalDate datePaiement; // optionnel si payé

    public enum Statut {
        PAYEE, EN_ATTENTE, ANNULEE
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (statut == null) {
            statut = Statut.EN_ATTENTE;
        }
    }
}
