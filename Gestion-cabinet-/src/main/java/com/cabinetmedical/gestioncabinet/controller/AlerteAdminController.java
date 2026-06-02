package com.cabinetmedical.gestioncabinet.controller;


import com.cabinetmedical.gestioncabinet.service.InscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import  com.cabinetmedical.gestioncabinet.repository.AlerteAdminRepository;
import  com.cabinetmedical.gestioncabinet.model.AlerteAdmin;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin/alertes")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
public class AlerteAdminController {

    private final AlerteAdminRepository alerteRepository;
    private final InscriptionService inscriptionService;

    @GetMapping("/non-lues")
    public ResponseEntity<List<AlerteAdmin>> getAlertesNonLues() {
        return ResponseEntity.ok(alerteRepository.findByLuFalseOrderByDateCreationDesc());
    }

    @GetMapping("/count-non-lues")
    public ResponseEntity<Long> countAlertesNonLues() {
        return ResponseEntity.ok(alerteRepository.countByLuFalse());
    }

    @PutMapping("/{id}/marquer-lu")
    public ResponseEntity<?> marquerCommeLu(@PathVariable Integer id) {
        AlerteAdmin alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte non trouvée"));
        alerte.setLu(true);
        alerteRepository.save(alerte);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/demande/{demandeId}/approuver")
    public ResponseEntity<?> approuverDemande(
            @PathVariable Integer demandeId,
            @RequestParam Integer adminId) {
        inscriptionService.approuverDemande(demandeId, adminId);
        return ResponseEntity.ok(Map.of("message", "Demande approuvée"));
    }

    @PostMapping("/demande/{demandeId}/rejeter")
    public ResponseEntity<?> rejeterDemande(
            @PathVariable Integer demandeId,
            @RequestParam Integer adminId,
            @RequestBody Map<String, String> body) {
        inscriptionService.rejeterDemande(demandeId, adminId, body.get("commentaire"));
        return ResponseEntity.ok(Map.of("message", "Demande rejetée"));
    }
}