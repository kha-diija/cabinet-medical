package com.cabinetmedical.gestioncabinet.dto.medecin;

import com.cabinetmedical.gestioncabinet.model.RendezVous;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {
    private Integer idRendezVous;
    private LocalDate dateRdv;
    private LocalTime heureRdv;
    private String motif;
    private String statut;
    private String notes;

    // Patient info
    private Integer patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private String patientTel;
    private String patientEmail;

    // Médecin info
    private Integer medecinId;
    private String medecinNom;
    private String medecinPrenom;

    // Info supplémentaires pour l'affichage
    private String allergies;
    private String derniereVisite;
    private Integer age;

    // Pour le frontend
    private String statutCouleur;
    private Boolean patientArrive = false;

    public static RendezVousDTO fromEntity(RendezVous rendezVous) {
        if (rendezVous == null) {
            return null;
        }

        RendezVousDTO dto = new RendezVousDTO();
        dto.setIdRendezVous(rendezVous.getIdRendezVous());
        dto.setDateRdv(rendezVous.getDateRdv());
        dto.setHeureRdv(rendezVous.getHeureRdv());
        dto.setMotif(rendezVous.getMotif().name());
        dto.setStatut(rendezVous.getStatut().name());
        dto.setNotes(rendezVous.getNotes());

        // Patient info
        if (rendezVous.getPatient() != null) {
            dto.setPatientId(rendezVous.getPatient().getId());
            dto.setPatientNom(rendezVous.getPatient().getNom());
            dto.setPatientPrenom(rendezVous.getPatient().getPrenom());
            dto.setPatientCin(rendezVous.getPatient().getCin());
            dto.setPatientTel(rendezVous.getPatient().getNumTel());
            dto.setPatientEmail(rendezVous.getPatient().getEmail());

            // Calculer l'âge
            if (rendezVous.getPatient().getDateNaissance() != null) {
                int age = LocalDate.now().getYear() - rendezVous.getPatient().getDateNaissance().getYear();
                dto.setAge(age);
            }

            // Récupérer les allergies du dossier médical
            if (rendezVous.getPatient().getDossierMedical() != null) {
                dto.setAllergies(rendezVous.getPatient().getDossierMedical().getAllergies());
            }
        }

        // Médecin info
        if (rendezVous.getMedecin() != null) {
            dto.setMedecinId(rendezVous.getMedecin().getId());
            dto.setMedecinNom(rendezVous.getMedecin().getNom());
            dto.setMedecinPrenom(rendezVous.getMedecin().getPrenom());
        }

        // Déterminer la couleur du statut en fonction du statut du RendezVous
        // Note: EN_COURS et URGENT n'existent pas dans votre enum Statut
        // Je vais utiliser seulement les statuts qui existent dans votre modèle
        switch (rendezVous.getStatut()) {
            case CONFIRME -> dto.setStatutCouleur("🟢");
            case EN_ATTENTE -> dto.setStatutCouleur("🟡");
            case ANNULE -> dto.setStatutCouleur("⚪");
            case TERMINE -> dto.setStatutCouleur("✅");
            default -> dto.setStatutCouleur("⚫");
        }

        return dto;
    }
}