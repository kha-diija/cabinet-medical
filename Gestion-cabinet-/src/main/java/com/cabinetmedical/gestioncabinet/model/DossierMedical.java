package com.cabinetmedical.gestioncabinet.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Dossier_Medical")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dossier")
    private Integer idDossier;

    @Column(name = "ant_medicaux", columnDefinition = "TEXT")
    private String antMedicaux;

    @Column(name = "ant_chirug", columnDefinition = "TEXT")
    private String antChirug;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String traitement;

    @Column(columnDefinition = "TEXT")
    private String habitudes;

    @Column(name = "date_creation", nullable = false)
    private LocalDate dateCreation;

    @OneToOne
    @JoinColumn(name = "id_patient", unique = true, nullable = false,
            foreignKey = @ForeignKey(name = "FK_DossierMedical_Patient"))
    @JsonIgnore
    private Patient patient;

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonIgnore // ⬅️ AJOUTEZ CETTE LIGNE
    private List<DocumentMedical> documents;

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonIgnore // ⬅️ AJOUTEZ CETTE LIGNE
    private List<Consultation> consultations;

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDate.now();
        }
    }
}
