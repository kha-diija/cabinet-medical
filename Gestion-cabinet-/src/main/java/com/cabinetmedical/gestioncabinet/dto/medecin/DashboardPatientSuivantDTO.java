// DashboardPatientSuivantDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DashboardPatientSuivantDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private Integer age;
    private LocalTime heureRdv;
    private String motif;
    private String statut;
}