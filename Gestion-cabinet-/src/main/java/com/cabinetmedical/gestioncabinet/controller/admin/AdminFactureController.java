package com.cabinetmedical.gestioncabinet.controller.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.AdminFactureDTO;
import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.service.admin.AdminFactureService;
import com.cabinetmedical.gestioncabinet.service.admin.CabinetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin-factures") // URL de base pour les factures administratives
@CrossOrigin(origins = "http://localhost:5173")
public class AdminFactureController {

    private final AdminFactureService adminFactureService;
    private final CabinetService cabinetService;

    public AdminFactureController(AdminFactureService adminFactureService, CabinetService cabinetService) {
        this.adminFactureService = adminFactureService;
        this.cabinetService = cabinetService;
    }

    // Récupérer toutes les factures
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public List<AdminFactureDTO> getAllFactures() {
        return adminFactureService.getAllFactures();
    }

    // Récupérer les factures d'un cabinet par son ID
    @GetMapping("/cabinet/{cabinetId}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")

    public List<AdminFactureDTO> getFacturesByCabinet(@PathVariable Integer cabinetId) {
        Cabinet cabinet = cabinetService.getCabinetById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        return adminFactureService.getFacturesByCabinet(cabinet);
    }
    @PutMapping("/{factureId}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")

    public AdminFactureDTO updateFacture(
            @PathVariable Integer factureId,
            @RequestBody AdminFacture updated
    ) {
        AdminFacture facture = adminFactureService.updateFacture(
                factureId,
                updated.getMontant(),   // BigDecimal
                updated.getPeriode()
        );

        return new AdminFactureDTO(
                facture.getIdFacture(),
                facture.getCabinet().getNom(),
                facture.getCabinet().getEmail(),
                facture.getMontant(),
                facture.getPeriode(),
                facture.getDateCreation(),
                facture.getDatePaiement(),
                facture.getStatut()
        );
    }

    @PostMapping("/{factureId}/payer")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")

    public AdminFactureDTO markFactureAsPaid(@PathVariable Integer factureId) {
        AdminFacture facture = adminFactureService.markAsPaid(factureId);
        return new AdminFactureDTO(
                facture.getIdFacture(),
                facture.getCabinet().getNom(),
                facture.getCabinet().getEmail(),
                facture.getMontant(),
                facture.getPeriode(),
                facture.getDateCreation(),
                facture.getDatePaiement(),
                facture.getStatut()
        );
    }

    // Filtrer les factures par période et statut
    @GetMapping("/filter")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")

    public List<AdminFactureDTO> filterFactures(
            @RequestParam Integer cabinetId,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam AdminFacture.Statut statut
    ) {
        Cabinet cabinet = cabinetService.getCabinetById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        LocalDateTime startDate = LocalDateTime.parse(start);
        LocalDateTime endDate = LocalDateTime.parse(end);
        return adminFactureService.filterFactures(cabinet, startDate, endDate, statut);
    }

    @PostMapping("/cabinet/{cabinetId}/create")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public AdminFactureDTO createFacture(@PathVariable Integer cabinetId) {
        Cabinet cabinet = cabinetService.getCabinetById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        AdminFacture facture = adminFactureService.createFactureForCabinet(cabinet);
        return new AdminFactureDTO(
                facture.getIdFacture(),
                facture.getCabinet().getNom(),
                facture.getCabinet().getEmail(),
                facture.getMontant(),
                facture.getPeriode(),
                facture.getDateCreation(),
                facture.getDatePaiement(),
                facture.getStatut()
        );
    }}
