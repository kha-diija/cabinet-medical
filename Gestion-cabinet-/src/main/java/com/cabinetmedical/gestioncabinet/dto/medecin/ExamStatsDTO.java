package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;

@Data
public class ExamStatsDTO {
    private String typeExamen;
    private int count;

    public ExamStatsDTO(String typeExamen, int count) {
        this.typeExamen = typeExamen;
        this.count = count;
    }
}


