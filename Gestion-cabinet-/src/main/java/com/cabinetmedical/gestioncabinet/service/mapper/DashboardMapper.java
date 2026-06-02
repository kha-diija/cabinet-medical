package com.cabinetmedical.gestioncabinet.service.mapper;

import com.cabinetmedical.gestioncabinet.dto.medecin.*;
import com.cabinetmedical.gestioncabinet.model.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DashboardMapper {

    public DashboardAppointmentDTO toAppointmentDTO(RendezVous rendezVous) {
        if (rendezVous == null) return null;

        DashboardAppointmentDTO dto = new DashboardAppointmentDTO();
        dto.setIdRendezVous(rendezVous.getIdRendezVous());
        dto.setDateRdv(rendezVous.getDateRdv());
        dto.setHeureRdv(rendezVous.getHeureRdv());
        dto.setMotif(rendezVous.getMotif().name());
        dto.setStatut(rendezVous.getStatut().name());

        // ✅ CORRECTION: Accès sécurisé au patient sans déclencher lazy loading
        Patient patient = rendezVous.getPatient();
        if (patient != null) {
            dto.setIdPatient(patient.getId());
            dto.setPatientNom(patient.getNom());
            dto.setPatientPrenom(patient.getPrenom());
            dto.setPatientCin(patient.getCin());
            dto.setPatientDateNaissance(patient.getDateNaissance());
            dto.setPatientNumTel(patient.getNumTel());
        }

        return dto;
    }

    public DashboardNotificationDTO toNotificationDTO(Notification notification) {
        if (notification == null) return null;

        DashboardNotificationDTO dto = new DashboardNotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType().name());
        dto.setMessage(notification.getMessage());
        dto.setDateNotification(notification.getDateNotification());

        // Déterminer la priorité basée sur le type
        String priority = "medium";
        switch (notification.getType()) {
            case RAPPEL_RDV:
            case PATIENT_EN_COURS:
                priority = "high";
                break;
            case NOUVEAU_PATIENT:
                priority = "medium";
                break;
            default:
                priority = "low";
        }
        dto.setPriority(priority);

        // ✅ CORRECTION: Accès sécurisé sans déclencher de lazy loading
        try {
            RendezVous rendezVous = notification.getRendezVous();
            if (rendezVous != null) {
                Patient patient = rendezVous.getPatient();
                if (patient != null) {
                    dto.setPatientNom(patient.getNom());
                    dto.setPatientPrenom(patient.getPrenom());
                }
            } else {
                Utilisateur utilisateur = notification.getUtilisateur();
                if (utilisateur != null) {
                    dto.setPatientNom(utilisateur.getNom());
                    dto.setPatientPrenom(utilisateur.getPrenom());
                }
            }
        } catch (Exception e) {
            // En cas d'erreur de lazy loading, on ignore simplement
        }

        return dto;
    }

    public DashboardPatientEnCoursDTO toPatientEnCoursDTO(PatientEnCours patientEnCours) {
        if (patientEnCours == null) return null;

        // ✅ CORRECTION: Vérification du patient avant accès
        Patient patient = patientEnCours.getPatient();
        if (patient == null) return null;

        DashboardPatientEnCoursDTO dto = new DashboardPatientEnCoursDTO();
        dto.setId(patient.getId());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setCin(patient.getCin());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setSexe(patient.getSexe().name());
        dto.setNumTel(patient.getNumTel());

        // Calculer l'âge
        if (patient.getDateNaissance() != null) {
            int age = Period.between(patient.getDateNaissance(), LocalDate.now()).getYears();
            dto.setAge(age);
        }

        // ✅ CORRECTION: Accès sécurisé au dossier médical
        try {
            DossierMedical dossier = patient.getDossierMedical();
            if (dossier != null) {
                dto.setAllergies(dossier.getAllergies());
            }
        } catch (Exception e) {
            // En cas d'erreur de lazy loading, on ignore
            dto.setAllergies(null);
        }

        // Temps d'attente
        if (patientEnCours.getDateEnvoi() != null) {
            long minutes = java.time.Duration.between(
                    patientEnCours.getDateEnvoi(),
                    java.time.LocalDateTime.now()
            ).toMinutes();
            String waitingTime = String.format("%dh%02dmin", minutes / 60, minutes % 60);
            dto.setWaitingTime(waitingTime);
        }

        return dto;
    }

    public DashboardPatientSuivantDTO toPatientSuivantDTO(RendezVous rendezVous) {
        if (rendezVous == null) return null;

        // ✅ CORRECTION: Vérification du patient avant accès
        Patient patient = rendezVous.getPatient();
        if (patient == null) return null;

        DashboardPatientSuivantDTO dto = new DashboardPatientSuivantDTO();
        dto.setId(patient.getId());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setHeureRdv(rendezVous.getHeureRdv());
        dto.setMotif(rendezVous.getMotif().name());
        dto.setStatut(rendezVous.getStatut().name());

        // Calculer l'âge
        if (patient.getDateNaissance() != null) {
            int age = Period.between(patient.getDateNaissance(), LocalDate.now()).getYears();
            dto.setAge(age);
        }

        return dto;
    }

    public List<DashboardAppointmentDTO> toAppointmentDTOs(List<RendezVous> rendezVous) {
        if (rendezVous == null) return List.of();

        return rendezVous.stream()
                .map(this::toAppointmentDTO)
                .filter(dto -> dto != null) // ✅ CORRECTION: Filtrer les nulls
                .collect(Collectors.toList());
    }

    public List<DashboardNotificationDTO> toNotificationDTOs(List<Notification> notifications) {
        if (notifications == null) return List.of();

        return notifications.stream()
                .map(this::toNotificationDTO)
                .filter(dto -> dto != null) // ✅ CORRECTION: Filtrer les nulls
                .collect(Collectors.toList());
    }

    public DashboardPatientEnCoursDTO toPatientEnCoursDTO(RendezVous rendezVous) {
        if (rendezVous == null) return null;

        Patient patient = rendezVous.getPatient();
        if (patient == null) return null;

        DashboardPatientEnCoursDTO dto = new DashboardPatientEnCoursDTO();
        dto.setId(patient.getId());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setCin(patient.getCin());
        dto.setDateNaissance(patient.getDateNaissance());

        // Calculer l'âge
        if (patient.getDateNaissance() != null) {
            int age = Period.between(patient.getDateNaissance(), LocalDate.now()).getYears();
            dto.setAge(age);
        }

        dto.setNumTel(patient.getNumTel());
        dto.setRendezVousId(rendezVous.getIdRendezVous());

        // Temps d'attente
        if (rendezVous.getHeureRdv() != null) {
            long minutes = java.time.Duration.between(
                    rendezVous.getHeureRdv(),
                    java.time.LocalTime.now()
            ).toMinutes();
            String waitingTime = String.format("%dh%02dmin", minutes / 60, minutes % 60);
            dto.setWaitingTime(waitingTime);
        }

        return dto;
    }
}