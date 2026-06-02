package com.cabinetmedical.gestioncabinet.dto.medecin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceExamenDTO {

    private Integer id;

    @NotBlank(message = "Le type d'examen est obligatoire")
    private String typeExamen;

    private String indications;

    private Boolean urgent = false;

    // Getters explicites pour s'assurer qu'ils sont reconnus
    public String getTypeExamen() {
        return typeExamen;
    }

    public String getIndications() {
        return indications;
    }

    public Boolean getUrgent() {
        return urgent;
    }
}