package com.cabinetmedical.gestioncabinet.dto.medecin;

import java.util.List;
import java.util.Optional;

public class DashboardDTO {
    private DashboardStatsDTO stats;
    private List<DashboardAppointmentDTO> appointments;
    private List<DashboardNotificationDTO> notifications;
    private Optional<DashboardPatientEnCoursDTO> patientEnCours;
    private Optional<DashboardPatientSuivantDTO> prochainPatient;

    // Constructeur par défaut
    public DashboardDTO() {
    }

    // Constructeur avec tous les champs
    public DashboardDTO(DashboardStatsDTO stats,
                        List<DashboardAppointmentDTO> appointments,
                        List<DashboardNotificationDTO> notifications,
                        Optional<DashboardPatientEnCoursDTO> patientEnCours,
                        Optional<DashboardPatientSuivantDTO> prochainPatient) {
        this.stats = stats;
        this.appointments = appointments;
        this.notifications = notifications;
        this.patientEnCours = patientEnCours;
        this.prochainPatient = prochainPatient;
    }

    // Getters et setters
    public DashboardStatsDTO getStats() {
        return stats;
    }

    public void setStats(DashboardStatsDTO stats) {
        this.stats = stats;
    }

    public List<DashboardAppointmentDTO> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<DashboardAppointmentDTO> appointments) {
        this.appointments = appointments;
    }

    public List<DashboardNotificationDTO> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<DashboardNotificationDTO> notifications) {
        this.notifications = notifications;
    }

    public Optional<DashboardPatientEnCoursDTO> getPatientEnCours() {
        return patientEnCours;
    }

    public void setPatientEnCours(Optional<DashboardPatientEnCoursDTO> patientEnCours) {
        this.patientEnCours = patientEnCours;
    }

    public Optional<DashboardPatientSuivantDTO> getProchainPatient() {
        return prochainPatient;
    }

    public void setProchainPatient(Optional<DashboardPatientSuivantDTO> prochainPatient) {
        this.prochainPatient = prochainPatient;
    }
}