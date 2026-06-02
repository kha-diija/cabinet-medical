
package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.Ordonnance;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
public class OrdonnanceDTO {
    private Integer id;
    private Ordonnance.Type type;
    private LocalDateTime date;
    private String contenu;
    private Integer idConsultation;

    // Patient
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private LocalDate patientDateNaissance;  // ✅ AJOUTER
    private String patientTel;                // ✅ AJOUTER

    // Médecin
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;

    // Examens (pour ordonnance EXAMENS)
    private List<OrdonnanceExamenDTO> examens;
}