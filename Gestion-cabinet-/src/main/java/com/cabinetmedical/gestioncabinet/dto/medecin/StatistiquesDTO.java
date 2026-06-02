// src/main/java/com/cabinetmedical/gestioncabinet/dto/medecin/StatistiquesDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDTO {
    private Long total;
    private Long confirmes;
    private Long enAttente;
    private Long annules;
    private Long termines;

    public StatistiquesDTO(Long total, Long confirmes, Long enAttente) {
        this.total = total;
        this.confirmes = confirmes;
        this.enAttente = enAttente;
        this.annules = 0L;
        this.termines = 0L;
    }
}

