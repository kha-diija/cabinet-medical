package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Medicament", indexes = {
        @Index(name = "idx_nom", columnList = "nom")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(length = 50)
    private String forme;

    @Column(length = 50)
    private String dosage;

    @Column(length = 200)
    private String dci;

    @Column(length = 100)
    private String laboratoire;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean actif = true;

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        dateAjout = LocalDateTime.now();
        if (actif == null) {
            actif = true;
        }
    }
}

