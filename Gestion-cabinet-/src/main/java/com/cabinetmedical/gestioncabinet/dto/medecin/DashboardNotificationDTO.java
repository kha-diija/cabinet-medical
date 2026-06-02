// DashboardNotificationDTO.java
package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DashboardNotificationDTO {
    private Integer id;
    private String type;
    private String message;
    private LocalDateTime dateNotification;
    private String priority; // high, medium, low
    private String patientNom;
    private String patientPrenom;
}