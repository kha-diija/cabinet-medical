// DashboardStatsDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;

@Data
public class DashboardStatsDTO {
    private Integer consultationsToday;
    private Integer consultationsChange; // Pourcentage ou nombre
    private Integer nouvellesConsultations;
    private Integer controles;
    private Integer nouveauxPatients;
    private Integer totalRendezVous;
    private Integer confirmes;
    private Integer enAttente;
    private Integer termines;
    private Integer annules;
}