package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MChangePasswordRequest;
import com.cabinetmedical.gestioncabinet.dto.medecin.MChangePasswordResponse;
import com.cabinetmedical.gestioncabinet.service.medecin.MMedecinPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/medecin/parametres")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_MEDECIN')")
public class MMedecinPasswordController {

    private final MMedecinPasswordService passwordService;

    /**
     * Endpoint pour changer le mot de passe
     * POST /api/medecin/parametres/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<MChangePasswordResponse> changePassword(
            @Valid @RequestBody MChangePasswordRequest request) {

        log.info("📥 [PasswordController] Requête de changement de mot de passe reçue");

        try {
            MChangePasswordResponse response = passwordService.changePassword(request);

            if (response.isSuccess()) {
                log.info("✅ [PasswordController] Mot de passe changé avec succès");
                return ResponseEntity.ok(response);
            } else {
                log.warn("⚠️ [PasswordController] Échec du changement de mot de passe: {}", response.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("❌ [PasswordController] Erreur lors du changement de mot de passe: {}", e.getMessage(), e);

            MChangePasswordResponse errorResponse = MChangePasswordResponse.builder()
                    .success(false)
                    .message("Erreur serveur lors du changement de mot de passe")
                    .timestamp(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint de test pour vérifier l'authentification
     * GET /api/medecin/parametres/test
     */
    @GetMapping("/test")
    public ResponseEntity<String> testAuth() {
        log.info("🧪 [PasswordController] Test d'authentification");
        return ResponseEntity.ok("Authentification OK - Médecin connecté");
    }
}