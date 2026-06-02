package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;

@Data
public class CabinetStatsDTO {
    private Integer totalPatients;
    private Integer totalConsultations;
    private Integer totalRendezVous;
    private Integer totalFactures;
    private Double revenuTotal;
    private Double revenuMoyen;
    private Integer consultationsCeMois;
    private Integer rendezVousAujourdhui;
}