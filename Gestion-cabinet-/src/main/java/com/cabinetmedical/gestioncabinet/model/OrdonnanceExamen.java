package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Ordonnance_Examen")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ordonnance", nullable = false)
    private Ordonnance ordonnance;

    @Column(name = "type_examen", nullable = false, length = 200)
    private String typeExamen;

    @Column(columnDefinition = "TEXT")
    private String indications;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean urgent = false;

    @PrePersist
    protected void onCreate() {
        if (urgent == null) {
            urgent = false;
        }
    }
}