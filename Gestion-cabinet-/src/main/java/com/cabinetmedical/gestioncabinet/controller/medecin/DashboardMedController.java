package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.DashboardDataDTO;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/medecin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardMedController {

    private final DashboardService dashboardService;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<DashboardDataDTO> getDashboardData() {
        try {
            log.info("=== Début getDashboardData ===");

            // Récupérer l'utilisateur depuis le username
            Utilisateur utilisateur = getCurrentUtilisateur();

            if (utilisateur == null) {
                log.error("Utilisateur non trouvé");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Integer medecinId = utilisateur.getId();
            Integer cabinetId = utilisateur.getCabinet() != null ? utilisateur.getCabinet().getId() : null;

            log.info("Médecin ID: {}, Cabinet ID: {}", medecinId, cabinetId);

            if (cabinetId == null) {
                log.warn("Cabinet ID est null, utilisation de cabinet par défaut (1)");
                cabinetId = 1;
            }

            DashboardDataDTO dashboardData = dashboardService.getDashboardData(medecinId, cabinetId);
            log.info("=== Fin getDashboardData (succès) ===");
            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            log.error("Erreur dans getDashboardData: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/current-patient/complete")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> completeCurrentPatient() {
        try {
            log.info("=== DEBUT completeCurrentPatient ===");

            Utilisateur utilisateur = getCurrentUtilisateur();

            if (utilisateur == null) {
                log.error("Utilisateur non trouvé");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Utilisateur non authentifié");
            }

            Integer medecinId = utilisateur.getId();
            log.info("Médecin ID: {}", medecinId);

            dashboardService.completeCurrentPatient(medecinId);

            log.info("=== FIN completeCurrentPatient (succès) ===");
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("❌ Erreur dans completeCurrentPatient: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/notifications/{notificationId}/read")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Integer notificationId) {
        Utilisateur utilisateur = getCurrentUtilisateur();
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Integer medecinId = utilisateur.getId();
        dashboardService.markNotificationAsRead(notificationId, medecinId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/read-all")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<Void> markAllNotificationsAsRead() {
        Utilisateur utilisateur = getCurrentUtilisateur();
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Integer medecinId = utilisateur.getId();
        dashboardService.markAllNotificationsAsRead(medecinId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/appointments/{appointmentId}/status")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<Void> updateAppointmentStatus(
            @PathVariable Integer appointmentId,
            @RequestBody UpdateStatusRequest request) {
        Utilisateur utilisateur = getCurrentUtilisateur();
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Integer medecinId = utilisateur.getId();
        dashboardService.updateAppointmentStatus(appointmentId, request.getStatus(), medecinId);
        return ResponseEntity.ok().build();
    }

    // ✅ MÉTHODE SIMPLIFIÉE - Fonctionne avec User standard
    private Utilisateur getCurrentUtilisateur() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("Pas d'authentification");
                return null;
            }

            String username;
            Object principal = authentication.getPrincipal();

            // Extraire le username selon le type de principal
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
                log.debug("Username extrait de UserDetails: {}", username);
            } else if (principal instanceof String) {
                username = (String) principal;
                log.debug("Username extrait de String: {}", username);
            } else {
                username = null;
                log.error("Type de principal inconnu: {}", principal.getClass().getName());
                return null;
            }

            // Récupérer l'utilisateur depuis la base de données
            return utilisateurRepository.findByLogin(username)
                    .orElseGet(() -> {
                        log.error("Utilisateur non trouvé pour login: {}", username);
                        return null;
                    });

        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'utilisateur: ", e);
            return null;
        }
    }

    // Classe interne pour la requête
    private static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}