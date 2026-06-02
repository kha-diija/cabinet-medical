package com.cabinetmedical.gestioncabinet.dto;


import lombok.Data;

@Data
public class ChangePasswordDTO {
    private String ancienMotDePasse;
    private String nouveauMotDePasse;

    public String getOldPassword() {
        return ancienMotDePasse;
    }

    public String getNewPassword() {
        return nouveauMotDePasse;
    }

    public String getConfirmPassword() {
        return nouveauMotDePasse;
    }
}