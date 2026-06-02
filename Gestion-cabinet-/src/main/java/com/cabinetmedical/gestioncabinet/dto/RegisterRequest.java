// RegisterRequest.java
        package com.cabinetmedical.gestioncabinet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le login est obligatoire")
    private String login;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre")
    private String password;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role; // MEDECIN, SECRETAIRE, ADMINISTRATEUR

    private String numTel;

    private String signature;

    private Integer cabinetId; // Pour MEDECIN et SECRETAIRE

    public String getEmail() {
        return login;
    }
}