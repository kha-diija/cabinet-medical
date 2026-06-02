package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PatientDTO {
    private Integer id;
    private String cin;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String sexe;
    private String numTel;
    private String typeMutuelle;
    private String adresse;
    private String email;
    private LocalDateTime dateCreation;
}