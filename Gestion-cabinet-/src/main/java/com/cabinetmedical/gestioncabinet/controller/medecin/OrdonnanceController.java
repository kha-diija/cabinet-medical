package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.*;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.OrdonnanceService;
import com.cabinetmedical.gestioncabinet.service.medecin.MedicamentService;
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
@RequestMapping("/api/medecin/ordonnances")
@RequiredArgsConstructor
@Slf4j
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;
    private final MedicamentService medicamentService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Récupérer la consultation EN_COURS
     * Route: GET /api/medecin/ordonnances/consultation-en-cours
     */
    @GetMapping("/consultation-en-cours")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getConsultationEnCours() {
        try {
            log.info("🔵 GET /api/medecin/ordonnances/consultation-en-cours");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            ConsultationDTO consultation = ordonnanceService.getConsultationEnCours(medecinId);

            if (consultation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Aucune consultation en cours");
            }

            log.info("✅ Consultation EN_COURS trouvée: {}", consultation.getIdConsultation());
            return ResponseEntity.ok(consultation);

        } catch (Exception e) {
            log.error("❌ Erreur récupération consultation EN_COURS: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Récupérer les ordonnances d'une consultation
     * Route: GET /api/medecin/ordonnances/consultation/{consultationId}
     */
    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> getOrdonnancesByConsultation(@PathVariable Integer consultationId) {
        try {
            log.info("🔵 GET /api/medecin/ordonnances/consultation/{}", consultationId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            List<OrdonnanceDTO> ordonnances = ordonnanceService.getOrdonnancesByConsultation(consultationId, medecinId);

            log.info("✅ {} ordonnances trouvées", ordonnances.size());
            return ResponseEntity.ok(ordonnances);

        } catch (Exception e) {
            log.error("❌ Erreur récupération ordonnances: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Créer une ordonnance MEDICAMENTS
     * Route: POST /api/medecin/ordonnances/medicaments
     */
    @PostMapping("/medicaments")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> createOrdonnanceMedicaments(@Valid @RequestBody OrdonnanceRequestDTO requestDTO) {
        try {
            log.info("🔵 POST /api/medecin/ordonnances/medicaments");
            log.info("🔵 Request DTO: {}", requestDTO);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            OrdonnanceDTO ordonnance = ordonnanceService.createOrdonnanceMedicaments(requestDTO, medecinId);

            log.info("✅ Ordonnance MEDICAMENTS créée: {}", ordonnance.getId());
            return ResponseEntity.ok(ordonnance);

        } catch (Exception e) {
            log.error("❌ Erreur création ordonnance MEDICAMENTS: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Créer une ordonnance EXAMENS
     * Route: POST /api/medecin/ordonnances/examens
     */
    @PostMapping("/examens")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> createOrdonnanceExamens(@Valid @RequestBody OrdonnanceRequestDTO requestDTO) {
        try {
            log.info("🔵 POST /api/medecin/ordonnances/examens");
            log.info("🔵 Request DTO: {}", requestDTO);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            OrdonnanceDTO ordonnance = ordonnanceService.createOrdonnanceExamens(requestDTO, medecinId);

            log.info("✅ Ordonnance EXAMENS créée: {}", ordonnance.getId());
            return ResponseEntity.ok(ordonnance);

        } catch (Exception e) {
            log.error("❌ Erreur création ordonnance EXAMENS: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Mettre à jour une ordonnance
     * Route: PUT /api/medecin/ordonnances/{ordonnanceId}
     */
    @PutMapping("/{ordonnanceId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> updateOrdonnance(
            @PathVariable Integer ordonnanceId,
            @Valid @RequestBody OrdonnanceRequestDTO requestDTO) {
        try {
            log.info("🔵 PUT /api/medecin/ordonnances/{}", ordonnanceId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            OrdonnanceDTO ordonnance = ordonnanceService.updateOrdonnance(ordonnanceId, requestDTO, medecinId);

            log.info("✅ Ordonnance mise à jour: {}", ordonnanceId);
            return ResponseEntity.ok(ordonnance);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour ordonnance: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Supprimer une ordonnance
     * Route: DELETE /api/medecin/ordonnances/{ordonnanceId}
     */
    @DeleteMapping("/{ordonnanceId}")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> deleteOrdonnance(@PathVariable Integer ordonnanceId) {
        try {
            log.info("🔵 DELETE /api/medecin/ordonnances/{}", ordonnanceId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié");
            }

            Integer medecinId = medecin.getId();
            ordonnanceService.deleteOrdonnance(ordonnanceId, medecinId);

            log.info("✅ Ordonnance supprimée: {}", ordonnanceId);
            return ResponseEntity.ok("Ordonnance supprimée avec succès");

        } catch (Exception e) {
            log.error("❌ Erreur suppression ordonnance: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Rechercher des médicaments
     * Route: GET /api/medecin/ordonnances/medicaments/search?q={query}
     */
    @GetMapping("/medicaments/search")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<?> searchMedicaments(@RequestParam String q) {
        try {
            log.info("🔵 GET /api/medecin/ordonnances/medicaments/search?q={}", q);

            List<MedicamentDTO> medicaments = medicamentService.searchMedicaments(q);

            log.info("✅ {} médicaments trouvés", medicaments.size());
            return ResponseEntity.ok(medicaments);

        } catch (Exception e) {
            log.error("❌ Erreur recherche médicaments: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur: " + e.getMessage());
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