package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.InscriptionCabinetDTO;
import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import com.cabinetmedical.gestioncabinet.service.InscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/inscription")
@RequiredArgsConstructor
@Slf4j
public class InscriptionController {

    private final InscriptionService inscriptionService;

    /**
     * 🔥 Endpoint simplifié : reçoit les URLs des fichiers (pas les fichiers eux-mêmes)
     */
    @PostMapping(value = "/demande", consumes = "application/json")
    public ResponseEntity<?> creerDemande(@RequestBody InscriptionCabinetDTO dto) {
        try {
            log.info("📥 Réception de la demande d'inscription pour: {}", dto.getNomCabinet());

            // Validation de base
            if (dto.getAcceptTerms() == null || !dto.getAcceptTerms()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Vous devez accepter les conditions générales"
                ));
            }

            // Créer la demande via le service
            DemandeCreationCabinet demande = inscriptionService.creerDemande(dto);

            log.info("✅ Demande créée avec succès - ID: {}", demande.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Votre demande d'inscription a été enregistrée avec succès ! Un administrateur va l'examiner prochainement.");
            response.put("demandeId", demande.getId());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Erreur métier: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Erreur serveur: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Une erreur est survenue lors du traitement de votre demande"
            ));
        }
    }

    /**
     * 🔥 Endpoint de test
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        log.info("✅ Test endpoint reached!");
        return ResponseEntity.ok(Map.of("message", "API is working!"));
    }
}