package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentDTO {
    private Integer id;
    private String nom;
    private String forme;
    private String dosage;
    private String dci;
    private String laboratoire;
    private Boolean actif;
}