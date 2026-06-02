package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.Consultation;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;

@Data
@ToString // ✅ Pour le debug
public class ConsultationRequestDTO {

    @NotNull(message = "Le type de consultation est obligatoire")
    private Consultation.Type type;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateConsultation;

    private String examenClinique;
    private String examenSupplementaire;
    private String diagnostic;
    private String traitement;
    private String observations;
}