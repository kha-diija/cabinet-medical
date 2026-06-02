// LoginRequest.java
package com.cabinetmedical.gestioncabinet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Le login est obligatoire")
    private String login;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role; // MEDECIN, SECRETAIRE, ADMINISTRATEUR

    private Integer cabinetId; // Obligatoire pour MEDECIN et SECRETAIRE
}