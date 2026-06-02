package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.Consultation;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {
    private Integer idConsultation;
    private Consultation.Type type;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateConsultation;

    private String examenClinique;
    private String examenSupplementaire;
    private String diagnostic;
    private String traitement;
    private String observations;

    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;

    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateCreation;

    // Supprimer la référence à OrdonnanceDTO si elle n'existe pas
    // private List<OrdonnanceDTO> ordonnances;
}