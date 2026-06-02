package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.FactureDTO;
import com.cabinetmedical.gestioncabinet.model.Facture;
import com.cabinetmedical.gestioncabinet.service.FactureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/secretaire/factures")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class FactureController {

    private final FactureService factureService;

    /**
     * Récupère toutes les factures du cabinet
     */
    @GetMapping
    public ResponseEntity<?> getFactures(Authentication authentication) {
        try {
            log.info("📋 Récupération des factures");

            // Vérifier si l'utilisateur est authentifié
            if (authentication == null || authentication.getName() == null) {
                log.warn("⚠️ Tentative d'accès sans authentification");
                // Pour le développement, on peut retourner toutes les factures
                // En production, il faudrait retourner une erreur 401
                List<FactureDTO> factures = factureService.getAllFactures();
                log.info("✅ {} factures récupérées (mode développement)", factures.size());
                return ResponseEntity.ok(factures);
            }

            String username = authentication.getName();
            log.info("👤 Utilisateur connecté: {}", username);

            List<FactureDTO> factures = factureService.getFacturesByCabinet(username);
            log.info("✅ {} factures récupérées pour {}", factures.size(), username);

            return ResponseEntity.ok(factures);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des factures", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération des factures"));
        }
    }

    /**
     * Récupère une facture par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFactureById(@PathVariable Integer id, Authentication authentication) {
        try {
            log.info("📄 Récupération de la facture {}", id);

            if (authentication == null || authentication.getName() == null) {
                log.warn("⚠️ Tentative d'accès sans authentification");
                FactureDTO facture = factureService.getFactureById(id);
                return ResponseEntity.ok(facture);
            }

            String username = authentication.getName();
            FactureDTO facture = factureService.getFactureById(id, username);

            return ResponseEntity.ok(facture);

        } catch (RuntimeException e) {
            log.error("❌ Facture {} non trouvée", id);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération de la facture {}", id, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération de la facture"));
        }
    }

    /**
     * Valide le paiement d'une facture
     */
    @PatchMapping("/{id}/valider-paiement")
    public ResponseEntity<?> validerPaiement(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            log.info("💳 Validation paiement facture {}", id);

            String username = authentication != null ? authentication.getName() : null;
            String modePaiement = body.get("modePaiement");

            if (modePaiement == null || modePaiement.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Mode de paiement requis"));
            }

            Facture.ModePaiement mode = Facture.ModePaiement.valueOf(modePaiement);
            FactureDTO facture = factureService.validerPaiement(id, mode, username);

            log.info("✅ Paiement validé pour la facture {}", id);
            return ResponseEntity.ok(facture);

        } catch (IllegalArgumentException e) {
            log.error("❌ Mode de paiement invalide: {}", body.get("modePaiement"));
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Mode de paiement invalide"));
        } catch (RuntimeException e) {
            log.error("❌ Erreur validation paiement facture {}", id, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la validation du paiement", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la validation du paiement"));
        }
    }

    /**
     * Annule une facture
     */
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<?> annulerFacture(@PathVariable Integer id, Authentication authentication) {
        try {
            log.info("❌ Annulation de la facture {}", id);

            String username = authentication != null ? authentication.getName() : null;
            FactureDTO facture = factureService.annulerFacture(id, username);

            log.info("✅ Facture {} annulée", id);
            return ResponseEntity.ok(facture);

        } catch (RuntimeException e) {
            log.error("❌ Erreur annulation facture {}", id, e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'annulation de la facture", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de l'annulation de la facture"));
        }
    }

    /**
     * Génère et télécharge le PDF d'une facture
     */
    @GetMapping("/{id}/imprimer")
    public ResponseEntity<?> imprimerFacture(@PathVariable Integer id, Authentication authentication) {
        try {
            log.info("🖨️ Impression de la facture {}", id);

            String username = authentication != null ? authentication.getName() : null;
            byte[] pdfBytes = factureService.genererPdfFacture(id, username);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "facture_" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            log.info("✅ PDF généré pour la facture {} ({} bytes)", id, pdfBytes.length);

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (RuntimeException e) {
            log.error("❌ Facture {} non trouvée pour impression", id);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()).toString().getBytes());
        } catch (Exception e) {
            log.error("❌ Erreur lors de la génération du PDF", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la génération du PDF").toString().getBytes());
        }
    }

    /**
     * Récupère les factures d'un patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getFacturesByPatient(
            @PathVariable Integer patientId,
            Authentication authentication) {
        try {
            log.info("📋 Récupération des factures du patient {}", patientId);

            String username = authentication != null ? authentication.getName() : null;
            List<FactureDTO> factures = factureService.getFacturesByPatient(patientId, username);

            log.info("✅ {} factures trouvées pour le patient {}", factures.size(), patientId);
            return ResponseEntity.ok(factures);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des factures du patient {}", patientId, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération des factures"));
        }
    }
    /**
     * Modifie les informations d'une facture
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> modifierFacture(
            @PathVariable Integer id,
            @RequestBody FactureDTO factureDTO,
            Authentication authentication) {
        try {
            log.info("✏️ Modification de la facture {}", id);

            String username = authentication != null ? authentication.getName() : null;

            // Validation basique
            if (factureDTO.getMontant() == null || factureDTO.getMontant().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Le montant doit être supérieur à 0"));
            }

            if (factureDTO.getModePaiement() == null) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("error", "Le mode de paiement est requis"));
            }

            FactureDTO facture = factureService.modifierFacture(id, factureDTO, username);

            log.info("✅ Facture {} modifiée avec succès", id);
            return ResponseEntity.ok(facture);

        } catch (IllegalStateException e) {
            log.error("❌ Impossible de modifier la facture {}: {}", id, e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("❌ Facture {} non trouvée", id);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la modification de la facture {}", id, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la modification de la facture"));
        }
    }
}