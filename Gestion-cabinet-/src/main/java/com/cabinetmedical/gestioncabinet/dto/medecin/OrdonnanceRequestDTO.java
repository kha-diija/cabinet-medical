package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.Ordonnance;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceRequestDTO {

    @NotNull(message = "Le type d'ordonnance est obligatoire")
    private Ordonnance.Type type;

    @NotBlank(message = "Le contenu de l'ordonnance est obligatoire")
    private String contenu;

    // Liste des examens pour les ordonnances d'examens
    private List<OrdonnanceExamenDTO> examens;

    // Getters explicites pour s'assurer qu'ils sont reconnus
    public String getContenu() {
        return contenu;
    }

    public List<OrdonnanceExamenDTO> getExamens() {
        return examens;
    }
}