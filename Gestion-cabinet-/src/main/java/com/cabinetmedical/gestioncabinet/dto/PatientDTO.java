package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {

    private Integer id;

    @NotBlank(message = "Le CIN est obligatoire")
    @Size(max = 20, message = "Le CIN ne doit pas dépasser 20 caractères")
    private String cin;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères")
    private String prenom;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @NotNull(message = "Le sexe est obligatoire")
    private String sexe; // HOMME, FEMME

    @Size(max = 20, message = "Le numéro de téléphone ne doit pas dépasser 20 caractères")
    private String numTel;

    @Size(max = 100, message = "Le type de mutuelle ne doit pas dépasser 100 caractères")
    private String typeMutuelle;

    @Size(max = 255, message = "L'adresse ne doit pas dépasser 255 caractères")
    private String adresse;

    @Email(message = "L'email doit être valide")
    @Size(max = 100, message = "L'email ne doit pas dépasser 100 caractères")
    private String email;

    private Integer idCabinet;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateCreation;

    // Informations supplémentaires
    private Integer age;
    private boolean hasDossierMedical;
    private Integer nombreConsultations;
    private String nomCabinet;

}