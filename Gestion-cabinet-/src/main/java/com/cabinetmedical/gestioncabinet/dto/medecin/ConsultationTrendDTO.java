package com.cabinetmedical.gestioncabinet.dto.medecin;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationTrendDTO {
    private String day;
    private Integer count;   // Nombre de consultations
    private LocalDate date;  // Date complète (optionnel)

}

