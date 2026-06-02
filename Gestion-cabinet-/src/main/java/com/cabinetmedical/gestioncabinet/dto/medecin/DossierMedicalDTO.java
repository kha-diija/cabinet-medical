package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {
    private Integer idDossier;
    private String antMedicaux;
    private String antChirug;
    private String allergies;
    private String traitement;
    private String habitudes;
    private LocalDate dateCreation;

    // Infos patient
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private LocalDate patientDateNaissance;
    private String patientSexe;
    private String patientTel;
}