package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.NotificationDTO;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Notification;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.CabinetmedRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.NotificationMedService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@Slf4j
public class NotificationMedController {

    private final NotificationMedService notificationService;
    private final UtilisateurRepository utilisateurRepository;
    private final CabinetmedRepository cabinetRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getNotifications() {
        try {
            log.info("🔍 [Notifications] Récupération des notifications");

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications] Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("✅ [Notifications] Utilisateur trouvé: {}", user.getLogin());

            Optional<Cabinet> cabinetOpt = cabinetRepository.findByUserId(user.getId());

            // Gérer le cas où l'utilisateur n'a pas de cabinet
            if (cabinetOpt.isEmpty()) {
                log.warn("⚠️ [Notifications] Aucun cabinet trouvé pour userId: {}. Retour notifications sans filtre cabinet", user.getId());

                List<Notification> notifications = notificationService.getNotificationsByUserId(user.getId());
                List<NotificationDTO> dtos = notifications.stream()
                        .map(NotificationDTO::fromEntity)
                        .collect(Collectors.toList());

                log.info("✅ [Notifications] {} notifications récupérées (sans cabinet)", dtos.size());
                return ResponseEntity.ok(dtos);
            }

            List<Notification> notifications = notificationService.getNotificationsByUserIdAndCabinet(
                    user.getId(),
                    cabinetOpt.get().getId()
            );

            List<NotificationDTO> dtos = notifications.stream()
                    .map(NotificationDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("✅ [Notifications] {} notifications récupérées", dtos.size());
            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("❌ [Notifications] Erreur inattendue:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        try {
            log.info("🔍 [Notifications] Récupération notifications non lues");

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications/unread] Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Optional<Cabinet> cabinetOpt = cabinetRepository.findByUserId(user.getId());

            if (cabinetOpt.isEmpty()) {
                log.warn("⚠️ [Notifications] Aucun cabinet pour unread - userId: {}", user.getId());
                List<Notification> notifications = notificationService.getUnreadNotifications(user.getId());
                List<NotificationDTO> dtos = notifications.stream()
                        .map(NotificationDTO::fromEntity)
                        .collect(Collectors.toList());

                log.info("✅ [Notifications/unread] {} notifications non lues (sans cabinet)", dtos.size());
                return ResponseEntity.ok(dtos);
            }

            List<Notification> notifications = notificationService.getUnreadNotificationsByUserIdAndCabinet(
                    user.getId(),
                    cabinetOpt.get().getId()
            );

            List<NotificationDTO> dtos = notifications.stream()
                    .map(NotificationDTO::fromEntity)
                    .collect(Collectors.toList());

            log.info("✅ [Notifications/unread] {} notifications non lues", dtos.size());
            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("❌ [Notifications/unread] Erreur:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        try {
            log.info("🔍 [Notifications] Comptage notifications non lues");

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications/unread-count] Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Optional<Cabinet> cabinetOpt = cabinetRepository.findByUserId(user.getId());

            long count;
            if (cabinetOpt.isEmpty()) {
                log.warn("⚠️ [Notifications] Aucun cabinet pour count - userId: {}", user.getId());
                count = notificationService.getUnreadCount(user.getId());
            } else {
                count = notificationService.countUnreadNotificationsByUserIdAndCabinet(
                        user.getId(),
                        cabinetOpt.get().getId()
                );
            }

            Map<String, Object> response = new HashMap<>();
            response.put("count", count);

            log.info("✅ [Notifications/unread-count] {} notifications non lues", count);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [Notifications/unread-count] Erreur:", e);
            Map<String, Object> response = new HashMap<>();
            response.put("count", 0);
            return ResponseEntity.ok(response);
        }
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        try {
            log.info("🔵 [Notifications] Marquage de toutes les notifications comme lues");

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications/read-all] Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Optional<Cabinet> cabinetOpt = cabinetRepository.findByUserId(user.getId());

            if (cabinetOpt.isEmpty()) {
                log.warn("⚠️ [Notifications] Aucun cabinet pour read-all - userId: {}", user.getId());
                notificationService.markAllAsRead(user.getId());
            } else {
                notificationService.markAllAsReadByUserIdAndCabinet(user.getId(), cabinetOpt.get().getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Toutes vos notifications ont été marquées comme lues");
            response.put("success", true);
            response.put("timestamp", java.time.LocalDateTime.now());

            log.info("✅ [Notifications/read-all] Toutes les notifications marquées comme lues");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [Notifications/read-all] Erreur:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Integer id) {
        try {
            log.info("🔵 [Notifications] Marquage notification {} comme lue", id);

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications/{}/read] Utilisateur non authentifié", id);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            notificationService.markAsRead(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notification marquée comme lue");
            response.put("success", true);

            log.info("✅ [Notifications/{}/read] Notification marquée comme lue", id);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [Notifications/{}/read] Erreur:", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> createTestNotification(@RequestBody TestNotificationRequest request) {
        try {
            log.info("🔵 [Notifications] Création notification test");

            Utilisateur user = getCurrentUtilisateur();
            if (user == null) {
                log.error("❌ [Notifications/test] Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Notification notification = notificationService.createNotification(
                    user.getId(),
                    request.getMessage(),
                    Notification.Type.valueOf(request.getType())
            );

            log.info("✅ [Notifications/test] Notification créée: {}", notification.getId());
            return ResponseEntity.ok(NotificationDTO.fromEntity(notification));

        } catch (Exception e) {
            log.error("❌ [Notifications/test] Erreur:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", auth != null && auth.isAuthenticated());
            response.put("name", auth != null ? auth.getName() : "N/A");
            response.put("principal", auth != null ? auth.getPrincipal().toString() : "N/A");
            response.put("authorities", auth != null ? auth.getAuthorities().toString() : "N/A");
            response.put("details", auth != null ? auth.getDetails() : "N/A");

            Utilisateur user = getCurrentUtilisateur();
            if (user != null) {
                response.put("utilisateur_id", user.getId());
                response.put("utilisateur_login", user.getLogin());
                response.put("utilisateur_role", user.getRole());
                response.put("utilisateur_cabinet", user.getCabinet() != null ? user.getCabinet().getId() : null);
            } else {
                response.put("utilisateur", "Non trouvé");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [Notifications/debug/auth] Erreur:", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ✅ MÉTHODE SIMPLIFIÉE - Fonctionne avec User standard de Spring Security
    private Utilisateur getCurrentUtilisateur() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("❌ Pas d'authentification");
                return null;
            }

            String username;
            Object principal = authentication.getPrincipal();

            // Extraire le username selon le type de principal
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
                log.debug("✅ Username extrait de UserDetails: {}", username);
            } else if (principal instanceof String) {
                username = (String) principal;
                log.debug("✅ Username extrait de String: {}", username);
            } else {
                username = null;
                log.error("❌ Type de principal inconnu: {}", principal.getClass().getName());
                return null;
            }

            // Récupérer l'utilisateur depuis la base de données
            return utilisateurRepository.findByLogin(username)
                    .orElseGet(() -> {
                        log.error("❌ Utilisateur non trouvé pour login: {}", username);
                        return null;
                    });

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de l'utilisateur: ", e);
            return null;
        }
    }

    @Data
    static class TestNotificationRequest {
        private String message;
        private String type;
    }
}