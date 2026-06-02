package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "Patient", indexes = {
        @Index(name = "idx_cin", columnList = "cin"),
        @Index(name = "idx_nom", columnList = "nom, prenom")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 20)
    private String cin;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sexe sexe;

    @Column(name = "num_tel", length = 20)
    private String numTel;

    @Column(name = "type_mutuelle", length = 100)
    private String typeMutuelle;

    @Column(length = 255)
    private String adresse;

    @Column(length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "id_cabinet", foreignKey = @ForeignKey(name = "FK_Patient_Cabinet"))
    private Cabinet cabinet;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonIgnore  // ✅ AJOUTEZ CETTE LIGNE
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonIgnore // Ajoutez cette annotation
    private List<RendezVous> rendezVous;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonIgnore // Ajoutez cette annotation
    private List<Consultation> consultations;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonIgnore // Ajoutez cette annotation
    private List<Facture> factures;

    public enum Sexe {
        HOMME, FEMME
    }
    public String getTelephone() {
        return this.numTel;
    }

    // ✅ APRÈS
    public Integer getIdPatient() {
        return this.id;
    }
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
