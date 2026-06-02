package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.DashboardDTO;
import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import com.cabinetmedical.gestioncabinet.repository.admin.DashboardRepositoryAdmin;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardServiceAdmin {

    private final DashboardRepositoryAdmin dashboardRepositoryAdmin;

    public DashboardServiceAdmin(DashboardRepositoryAdmin dashboardRepositoryAdmin) {
        this.dashboardRepositoryAdmin = dashboardRepositoryAdmin;
    }

    public DashboardDTO getDashboardStatsDTO() {
        DashboardDTO dto = new DashboardDTO();

        // 1️⃣ Statistiques globales
        dto.setTotalCabinets(dashboardRepositoryAdmin.countCabinets());
        dto.setActiveUsers(dashboardRepositoryAdmin.countActiveUsers());
        dto.setPendingAdminFactures(dashboardRepositoryAdmin.countPendingAdminFactures());
        double totalRevenue = dashboardRepositoryAdmin.totalRevenue();
        NumberFormat formatter = NumberFormat.getInstance(new Locale("fr", "MA"));
        dto.setTotalRevenue(formatter.format(totalRevenue) + " MAD");

        // 2️⃣ Résumé mensuel
        LocalDateTime startOfYear = LocalDateTime.now().withDayOfYear(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfYear = LocalDateTime.now().withMonth(12).withDayOfMonth(31)
                .withHour(23).withMinute(59).withSecond(59);

        List<AdminFacture> factures = dashboardRepositoryAdmin.findAdminFacturesBetween(startOfYear, endOfYear);
        List<DashboardDTO.MonthlyData> monthlyData = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            DashboardDTO.MonthlyData md = new DashboardDTO.MonthlyData();
            md.setMonth(YearMonth.of(LocalDateTime.now().getYear(), i).getMonth().name().substring(0, 3));
            md.setCabinets(0);
            md.setUtilisateurs(0);
            md.setAdminFactures(0);
            monthlyData.add(md);
        }
        for (AdminFacture f : factures) {
            int monthIndex = f.getDateCreation().getMonthValue() - 1;
            DashboardDTO.MonthlyData md = monthlyData.get(monthIndex);
            md.setCabinets(md.getCabinets() + 1);
            md.setUtilisateurs(md.getUtilisateurs() + 1);
            md.setAdminFactures(md.getAdminFactures() + (f.getMontant() != null ? f.getMontant().doubleValue() : 0));
        }
        dto.setMonthlyData(monthlyData);

        // 3️⃣ Activités récentes
        List<DashboardDTO.ActivityDTO> recentActivities = new ArrayList<>();

        // Dernières factures payées
        dashboardRepositoryAdmin.findLastAdminFactures(PageRequest.of(0, 5))
                .forEach(f -> recentActivities.add(new DashboardDTO.ActivityDTO(
                        "Facture payée",
                        "INV-" + f.getIdFacture(), // utilise idFacture si pas de référence
                        formatTimeAgo(f.getDateCreation())
                )));

        // Derniers cabinets créés
        dashboardRepositoryAdmin.findLastCabinets(PageRequest.of(0, 5))
                .forEach(c -> recentActivities.add(new DashboardDTO.ActivityDTO(
                        "Cabinet créé",
                        c.getNom(),
                        formatTimeAgo(c.getDateCreation())
                )));

        // Derniers utilisateurs ajoutés
        dashboardRepositoryAdmin.findLastUsers(PageRequest.of(0, 5))
                .forEach(u -> recentActivities.add(new DashboardDTO.ActivityDTO(
                        "Utilisateur ajouté" ,
                        u.getNom(),
                        formatTimeAgo(u.getDateCreation())
                )));

        // Tri par date décroissante
        recentActivities.sort((a, b) -> b.getTimeAgo().compareTo(a.getTimeAgo()));

        // Limiter à 10 activités
        dto.setRecentActivities(recentActivities.size() > 10 ? recentActivities.subList(0, 10) : recentActivities);

        return dto;
    }

    // Méthode pour convertir LocalDateTime en texte "Il y a X heures/jours..."
    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        if (minutes < 60) return "Il y a " + minutes + " minutes";
        long hours = minutes / 60;
        if (hours < 24) return "Il y a " + hours + " heures";
        long days = hours / 24;
        if (days < 30) return "Il y a " + days + " jours";
        long months = days / 30;
        if (months < 12) return "Il y a " + months + " mois";
        long years = months / 12;
        return "Il y a " + years + " ans";
    }
}
