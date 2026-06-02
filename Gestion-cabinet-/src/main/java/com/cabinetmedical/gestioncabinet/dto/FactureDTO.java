package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDTO {

    private Integer idFacture;

    @NotNull(message = "Le montant est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le montant doit être positif")
    @Digits(integer = 10, fraction = 2, message = "Le montant doit avoir au maximum 10 chiffres avant la virgule et 2 après")
    private BigDecimal montant;

    @NotNull(message = "Le mode de paiement est obligatoire")
    private String modePaiement; // ESPECES, CARTE, ASSURANCE, CHEQUE

    private String statut; // PAYEE, EN_ATTENTE, ANNULEE

    @NotNull(message = "La date d'émission est obligatoire")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEmission;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate datePaiement;

    private Integer idConsultation;

    @NotNull(message = "Le patient est obligatoire")
    private Integer idPatient;

    @NotNull(message = "Le cabinet est obligatoire")
    private Integer idCabinet;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateCreation;

    // Informations enrichies
    private String nomPatient;
    private String prenomPatient;
    private String cinPatient;
    private String nomCabinet;
    private LocalDate dateConsultation;

    public void setMotifConsultation(String motif) {
        // On pourrait stocker le motif dans le champ observations si nécessaire
        // Ou juste l'associer à un champ dédié
        this.statut = motif; // ou créer un champ motifConsultation
    }

}
