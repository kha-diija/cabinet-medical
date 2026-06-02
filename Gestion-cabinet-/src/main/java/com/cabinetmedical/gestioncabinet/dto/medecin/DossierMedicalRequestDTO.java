package com.cabinetmedical.gestioncabinet.dto.medecin;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalRequestDTO {
    private String antMedicaux;
    private String antChirug;
    private String allergies;
    private String traitement;
    private String habitudes;
}