package com.cabinetmedical.gestioncabinet.model;
import com.fasterxml.jackson.annotation.JsonManagedReference; // AJOUTEZ CET IMPORT

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;  // ✅ AJOUTEZ CET IMPORT


@Entity
@Table(name = "Cabinet")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cabinet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 255)
    private String logo;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 100)
    private String email;


    @Column(length = 100)
    private String specialite;

    @Column(length = 255)
    private String adresse;

    @Column(length = 20)
    private String tel;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean actif = true;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Utilisateur> utilisateurs;

    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Patient> patients;

    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Facture> factures;

    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL)
    @JsonManagedReference
    @JsonIgnore
    private List<AdminFacture> adminFactures;


    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (actif == null) {
            actif = true;
        }
    }

    public Integer getIdCabinet() {
        return id;
    }

    public boolean isActif() {
        return Boolean.TRUE.equals(this.actif);
    }

}