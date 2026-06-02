package com.cabinetmedical.gestioncabinet.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private long totalCabinets;
    private long activeUsers;
    private long pendingAdminFactures; // AdminFactures en attente
    private String totalRevenue; // exemple: "45.2K€"

    private List<MonthlyData> monthlyData;
    private List<ActivityDTO> recentActivities;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private long cabinets;
        private long utilisateurs;
        private double adminFactures; // Montant total des AdminFactures payées
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDTO {
        private String action;
        private String detail;
        private String timeAgo; // "Il y a 2 heures"
    }
}
