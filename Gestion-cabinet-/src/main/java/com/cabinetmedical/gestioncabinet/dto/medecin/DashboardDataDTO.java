// DashboardDataDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDataDTO {
    private DashboardStatsDTO stats;
    private List<ConsultationTrendDTO> consultationTrend;
    private List<ConsultationTypeDTO> consultationTypes;
    private List<ExamStatDTO> examStats;
    private List<DashboardAppointmentDTO> todayAppointments;
    private List<DashboardNotificationDTO> notifications;
    private DashboardPatientEnCoursDTO currentPatient;
    private DashboardPatientSuivantDTO nextPatient;
}