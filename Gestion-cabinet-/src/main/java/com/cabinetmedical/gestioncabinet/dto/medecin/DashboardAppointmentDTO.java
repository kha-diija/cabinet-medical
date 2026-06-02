// DashboardAppointmentDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DashboardAppointmentDTO {
    private Integer idRendezVous;
    private LocalDate dateRdv;
    private LocalTime heureRdv;
    private String motif;
    private String statut;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private LocalDate patientDateNaissance;
    private String patientNumTel;
}