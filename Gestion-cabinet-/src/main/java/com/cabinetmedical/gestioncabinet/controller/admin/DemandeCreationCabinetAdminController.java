package com.cabinetmedical.gestioncabinet.controller.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.DemandeDTO;
import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import com.cabinetmedical.gestioncabinet.service.admin.DemandeCreationCabinetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeCreationCabinetAdminController {

    private final DemandeCreationCabinetService demandeService;
    private final UtilisateurRepository utilisateurRepository;

    public DemandeCreationCabinetAdminController(
            DemandeCreationCabinetService demandeService,
            UtilisateurRepository utilisateurRepository
    ) {
        this.demandeService = demandeService;
        this.utilisateurRepository = utilisateurRepository;
    }

    // 🔹 Récupérer toutes les demandes
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public List<DemandeDTO> getAllDemandes(@RequestParam(required = false) DemandeCreationCabinet.Statut statut) {
        if (statut == null) {
            return demandeService.getAllDemandes();
        }
        return demandeService.getDemandesByStatut(statut);
    }

    // 🔹 Approuver une demande
    @PostMapping("/{id}/approuver")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public String approuverDemande(@PathVariable Integer id,
                                   Authentication authentication) {

        // ✅ Récupérer l'email depuis le Principal (car vous utilisez l'email pour la connexion)
        String email = authentication.getName();

        // ✅ Charger l'entité Utilisateur depuis la BDD par email
        Utilisateur admin = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Administrateur introuvable: " + email));

        demandeService.approuverDemande(id, admin);

        return "Demande approuvée avec succès";
    }

    // 🔹 Rejeter une demande
    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public String rejeterDemande(
            @PathVariable Integer id,
            @RequestBody RejetDemandeDTO dto,
            Authentication authentication
    ) {
        // ✅ Récupérer l'email depuis le Principal (car vous utilisez l'email pour la connexion)
        String email = authentication.getName();

        // ✅ Charger l'entité Utilisateur depuis la BDD par email
        Utilisateur admin = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Administrateur introuvable: " + email));

        demandeService.rejeterDemande(id, dto.commentaire(), admin);
        return "Demande rejetée avec succès";
    }

    // DTO interne pour le rejet
    public record RejetDemandeDTO(String commentaire) {}
}