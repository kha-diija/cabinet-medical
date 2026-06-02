package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO pour le profil utilisateur
 * ✅ Version simple sans références circulaires
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileDTO {

    @NotNull(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "Le prénom est obligatoire")
    private String prenom;

    @NotNull(message = "Le login est obligatoire")
    private String login;

    private String numTel;

    // Constructeur pour création simplifiée
    public ProfileDTO(String nom, String prenom, String login) {
        this.nom = nom;
        this.prenom = prenom;
        this.login = login;
    }
}