package com.cabinetmedical.gestioncabinet.dto;

import lombok.Data;

@Data
public class PatientSearchDTO {
    private String cin;
    private String nom;
    private String prenom;
    private String email;
    private String numTel;
}