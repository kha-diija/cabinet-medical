package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Patient_En_Cours",
        uniqueConstraints = @UniqueConstraint(name = "unique_patient_medecin",
                columnNames = {"id_patient", "id_medecin", "actif"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientEnCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", nullable = false,
            foreignKey = @ForeignKey(name = "FK_PatientEnCours_Patient"))
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", nullable = false,
            foreignKey = @ForeignKey(name = "FK_PatientEnCours_Medecin"))
    private Utilisateur medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_secretaire", nullable = false,
            foreignKey = @ForeignKey(name = "FK_PatientEnCours_Secretaire"))
    private Utilisateur secretaire;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean actif = true;

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
        if (actif == null) {
            actif = true;
        }
    }
}