// DashboardPatientEnCoursDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DashboardPatientEnCoursDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private String cin;
    private LocalDate dateNaissance;
    private Integer age;
    private String sexe;
    private String numTel;
    private String allergies;
    private Integer rendezVousId;  // AJOUTER CE CHAMP

    private String waitingTime; // Format "1h30min"



    // AJOUTER GETTER/SETTER
    public Integer getRendezVousId() {
        return rendezVousId;
    }

    public void setRendezVousId(Integer rendezVousId) {
        this.rendezVousId = rendezVousId;
    }
}
