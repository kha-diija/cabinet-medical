package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {

    private Integer idRendezVous;

    @NotNull(message = "La date du rendez-vous est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateRdv;

    @NotNull(message = "L'heure du rendez-vous est obligatoire")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime heureRdv;

    @NotNull(message = "Le motif est obligatoire")
    private String motif; // CONSULTATION, CONTROLE

    private String statut; // CONFIRME, ANNULE, EN_ATTENTE, TERMINE

    @Size(max = 1000, message = "Les notes ne doivent pas dépasser 1000 caractères")
    private String notes;

    @NotNull(message = "Le patient est obligatoire")
    private Integer idPatient;

    @NotNull(message = "Le médecin est obligatoire")
    private Integer idMedecin;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateCreation;

    // Informations enrichies
    private String nomPatient;
    private String prenomPatient;
    private String cinPatient;
    private String nomMedecin;
    private String prenomMedecin;
    private boolean hasConsultation;
}