package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.ConsultationDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.ConsultationRequestDTO;
import com.cabinetmedical.gestioncabinet.exception.medecin.ConsultationAlreadyExistsException;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/consultations")
@RequiredArgsConstructor
@Slf4j
public class ConsultationController {

    private final ConsultationService consultationService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Récupérer l'historique des consultations d'un patient spécifique
     * Route: GET /api/medecin/consultations/{patientId}
     */
    @GetMapping("/{patientId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getPatientConsultationHistory(@PathVariable Integer patientId) {
        try {
            log.info("🔵 GET /api/medecin/consultations/{}", patientId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                log.error("❌ Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            log.info("🔵 Médecin ID: {}, Patient ID: {}", medecinId, patientId);

            List<ConsultationDTO> history = consultationService.getPatientConsultationHistoryById(
                    patientId,
                    medecinId
            );

            log.info("✅ {} consultations trouvées", history.size());
            return ResponseEntity.ok(history);

        } catch (Exception e) {
            log.error("❌ Erreur récupération historique patient {}: ", patientId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Créer une nouvelle consultation pour le patient EN_COURS
     * Route: POST /api/medecin/consultations
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> createConsultation(@Valid @RequestBody ConsultationRequestDTO requestDTO) {
        try {
            log.info("🔵 === POST /api/medecin/consultations ===");
            log.info("🔵 Request DTO: {}", requestDTO);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                log.error("❌ Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            Integer cabinetId = medecin.getCabinet() != null ? medecin.getCabinet().getId() : 1;

            log.info("🔵 Médecin ID: {}, Cabinet ID: {}", medecinId, cabinetId);

            ConsultationDTO consultation = consultationService.createConsultation(requestDTO, medecinId, cabinetId);

            log.info("✅ Consultation créée: {}", consultation.getIdConsultation());
            return ResponseEntity.ok(consultation);

        } catch (ConsultationAlreadyExistsException e) {
            log.warn("⚠️ Consultation déjà existante: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT) // 409 Conflict
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur création consultation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Mettre à jour une consultation existante
     * Route: PUT /api/medecin/consultations/{consultationId}
     */
    @PutMapping("/{consultationId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> updateConsultation(
            @PathVariable Integer consultationId,
            @Valid @RequestBody ConsultationRequestDTO requestDTO) {
        try {
            log.info("🔵 PUT /api/medecin/consultations/{}", consultationId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            ConsultationDTO consultation = consultationService.updateConsultation(consultationId, requestDTO, medecinId);

            log.info("✅ Consultation mise à jour: {}", consultationId);
            return ResponseEntity.ok(consultation);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour consultation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Récupérer une consultation spécifique par son ID
     * Route: GET /api/medecin/consultations/consultation/{consultationId}
     */
    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getConsultation(@PathVariable Integer consultationId) {
        try {
            log.info("🔵 GET /api/medecin/consultations/consultation/{}", consultationId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            ConsultationDTO consultation = consultationService.getConsultationById(consultationId, medecinId);

            return ResponseEntity.ok(consultation);

        } catch (Exception e) {
            log.error("❌ Erreur récupération consultation: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Consultation non trouvée");
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
}