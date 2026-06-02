package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.NotificationDTO;
import com.cabinetmedical.gestioncabinet.model.Notification;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/secretaire/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * ✅ Récupère les médecins du cabinet
     */
    @GetMapping("/medecins")
    public ResponseEntity<List<Map<String, Object>>> getMedecinsDuCabinet(Authentication authentication) {
        Utilisateur secretaire = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (secretaire.getCabinet() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Utilisateur> medecins = utilisateurRepository.findByCabinetIdAndRoleAndActifTrue(
                secretaire.getCabinet().getId(),
                Utilisateur.Role.MEDECIN
        );

        List<Map<String, Object>> medecinsDTO = medecins.stream()
                .map(medecin -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", medecin.getId());
                    dto.put("nom", medecin.getNom());
                    dto.put("prenom", medecin.getPrenom());
                    dto.put("role", medecin.getRole().name());
                    dto.put("numTel", medecin.getNumTel());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(medecinsDTO);
    }

    /**
     * ✅ Envoyer une notification à un médecin (avec support patient)
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> envoyerNotification(
            @RequestBody NotificationDTO dto,
            Authentication authentication) {

        Utilisateur secretaire = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        try {
            notificationService.creerNotification(dto, secretaire);
            return ResponseEntity.ok(Map.of("message", "Notification envoyée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * ✅ Récupère les notifications envoyées par la secrétaire
     */
    @GetMapping("/envoyees")
    public ResponseEntity<List<Map<String, Object>>> getNotificationsEnvoyees(Authentication authentication) {
        Utilisateur secretaire = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (secretaire.getCabinet() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Notification> notifications = notificationService.findBySecrétaire(
                secretaire.getCabinet().getId()
        );

        List<Map<String, Object>> notificationsDTO = notifications.stream()
                .map(notif -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", notif.getId());
                    dto.put("type", notif.getType().name());
                    dto.put("message", notif.getMessage());
                    dto.put("lu", notif.getLu());
                    dto.put("dateNotification", notif.getDateNotification());

                    // Destinataire
                    if (notif.getUtilisateur() != null) {
                        Map<String, Object> destinataire = new HashMap<>();
                        destinataire.put("id", notif.getUtilisateur().getId());
                        destinataire.put("nom", notif.getUtilisateur().getNom());
                        destinataire.put("prenom", notif.getUtilisateur().getPrenom());
                        dto.put("destinataire", destinataire);
                    }

                    // Rendez-vous
                    if (notif.getRendezVous() != null) {
                        Map<String, Object> rdv = new HashMap<>();
                        rdv.put("id", notif.getRendezVous().getId());
                        rdv.put("dateHeureDebut", notif.getRendezVous().getDateHeureDebut());
                        dto.put("rendezVous", rdv);
                    }

                    // ✅ NOUVEAU : Patient
                    if (notif.getPatient() != null) {
                        Map<String, Object> patient = new HashMap<>();
                        patient.put("id", notif.getPatient().getId());
                        patient.put("nom", notif.getPatient().getNom());
                        patient.put("prenom", notif.getPatient().getPrenom());
                        patient.put("cin", notif.getPatient().getCin());
                        dto.put("patient", patient);
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(notificationsDTO);
    }

    /**
     * ✅ Récupère toutes les notifications de l'utilisateur connecté
     */
    @GetMapping("/mes-notifications")
    public ResponseEntity<List<Map<String, Object>>> getMesNotifications(Authentication authentication) {
        Utilisateur utilisateur = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Notification> notifications = notificationService.findByUtilisateur(utilisateur);

        List<Map<String, Object>> notificationsDTO = notifications.stream()
                .map(notif -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", notif.getId());
                    dto.put("type", notif.getType().name());
                    dto.put("message", notif.getMessage());
                    dto.put("lu", notif.getLu());
                    dto.put("dateNotification", notif.getDateNotification());

                    // ✅ NOUVEAU : Patient dans les notifications reçues
                    if (notif.getPatient() != null) {
                        Map<String, Object> patient = new HashMap<>();
                        patient.put("id", notif.getPatient().getId());
                        patient.put("nom", notif.getPatient().getNom());
                        patient.put("prenom", notif.getPatient().getPrenom());
                        patient.put("cin", notif.getPatient().getCin());
                        dto.put("patient", patient);
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(notificationsDTO);
    }

    /**
     * Marquer une notification comme lue
     */
    @PatchMapping("/{id}/marquer-lue")
    public ResponseEntity<Map<String, String>> marquerCommeLue(@PathVariable Integer id) {
        try {
            notificationService.marquerCommeLu(id);
            return ResponseEntity.ok(Map.of("message", "Notification marquée comme lue"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    @PatchMapping("/marquer-toutes-lues")
    public ResponseEntity<Map<String, String>> marquerToutesCommeLues(Authentication authentication) {
        Utilisateur utilisateur = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        notificationService.marquerToutesCommeLues(utilisateur);
        return ResponseEntity.ok(Map.of("message", "Toutes les notifications ont été marquées comme lues"));
    }
}