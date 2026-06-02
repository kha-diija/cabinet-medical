package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.DossierMedicalDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.DossierMedicalRequestDTO;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.DossierMedicalService;
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

@RestController
@RequestMapping("/api/medecin/dossiers-medicaux")
@RequiredArgsConstructor
@Slf4j
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Récupérer le dossier médical du patient EN_COURS
     * Route: GET /api/medecin/dossiers-medicaux/current
     */
    @GetMapping("/current")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getCurrentPatientDossierMedical() {
        try {
            log.info("🔵 GET /api/medecin/dossiers-medicaux/current");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                log.error("❌ Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            log.info("🔵 Médecin ID: {}", medecinId);

            DossierMedicalDTO dossier = dossierMedicalService.getDossierMedicalForCurrentPatient(medecinId);

            if (dossier == null) {
                log.warn("⚠️ Aucun patient en cours");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Aucun patient en cours");
            }

            log.info("✅ Dossier médical trouvé");
            return ResponseEntity.ok(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur récupération dossier médical: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Créer un dossier médical pour le patient EN_COURS
     * Route: POST /api/medecin/dossiers-medicaux
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> createDossierMedical(@Valid @RequestBody DossierMedicalRequestDTO requestDTO) {
        try {
            log.info("🔵 === POST /api/medecin/dossiers-medicaux ===");
            log.info("🔵 Request DTO: {}", requestDTO);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                log.error("❌ Utilisateur non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            log.info("🔵 Médecin ID: {}", medecinId);

            DossierMedicalDTO dossier = dossierMedicalService.createDossierMedical(requestDTO, medecinId);

            log.info("✅ Dossier médical créé: {}", dossier.getIdDossier());
            return ResponseEntity.status(HttpStatus.CREATED).body(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur création dossier médical: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Mettre à jour le dossier médical du patient EN_COURS
     * Route: PUT /api/medecin/dossiers-medicaux
     */
    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> updateDossierMedical(@Valid @RequestBody DossierMedicalRequestDTO requestDTO) {
        try {
            log.info("🔵 PUT /api/medecin/dossiers-medicaux");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            DossierMedicalDTO dossier = dossierMedicalService.updateDossierMedical(requestDTO, medecinId);

            log.info("✅ Dossier médical mis à jour");
            return ResponseEntity.ok(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour dossier médical: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Récupérer un dossier médical par patient ID
     * Route: GET /api/medecin/dossiers-medicaux/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getDossierMedicalByPatientId(@PathVariable Integer patientId) {
        try {
            log.info("🔵 GET /api/medecin/dossiers-medicaux/patient/{}", patientId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer cabinetId = medecin.getCabinet() != null ? medecin.getCabinet().getId() : null;

            if (cabinetId == null) {
                log.error("❌ Médecin sans cabinet associé");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Médecin sans cabinet associé");
            }

            DossierMedicalDTO dossier = dossierMedicalService.getDossierMedicalByPatientId(patientId, cabinetId);

            return ResponseEntity.ok(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur récupération dossier: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dossier non trouvé");
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