package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.CabinetDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.CabinetInfoDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.CabinetStatsDTO;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.medecin.CabinetmedRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.CabinetmedService;
import com.cabinetmedical.gestioncabinet.service.medecin.UtilisateurMedService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/cabinet")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CabinetmedController {

    private final CabinetmedService cabinetService;
    private final UtilisateurMedService utilisateurMedService;
    private final CabinetmedRepository cabinetRepository;

    @Value("${file.base-url:http://localhost:8080}")
    private String baseUrl;

    @GetMapping("/info")
    public ResponseEntity<CabinetInfoDTO> getCabinetInfo(Authentication authentication) {
        System.out.println("🔍 [Cabinet] Récupération info cabinet pour: " + authentication.getName());

        String username = authentication.getName();
        Utilisateur user = utilisateurMedService.findByLogin(username);

        System.out.println("👤 [Cabinet] Utilisateur trouvé: " + user.getId() + " - " + user.getLogin());

        Optional<Cabinet> cabinetOpt = cabinetRepository.findByUserId(user.getId());

        if (cabinetOpt.isEmpty()) {
            System.out.println("❌ [Cabinet] Aucun cabinet trouvé pour userId: " + user.getId());
            return ResponseEntity.notFound().build();
        }

        Cabinet cabinet = cabinetOpt.get();
        System.out.println("🏥 [Cabinet] Cabinet trouvé: " + cabinet.getId() + " - " + cabinet.getNom());
        System.out.println("🖼️ [Cabinet] Logo dans DB: " + cabinet.getLogo());

        CabinetInfoDTO dto = convertToInfoDTO(cabinet, user);

        System.out.println("📤 [Cabinet] DTO renvoyé avec logo: " + dto.getLogo());

        return ResponseEntity.ok(dto);
    }

    private CabinetInfoDTO convertToInfoDTO(Cabinet cabinet, Utilisateur user) {
        CabinetInfoDTO dto = new CabinetInfoDTO();
        dto.setId(cabinet.getId());
        dto.setNom(cabinet.getNom());
        dto.setSpecialite(cabinet.getSpecialite());
        dto.setAdresse(cabinet.getAdresse());
        dto.setTel(cabinet.getTel());

        // ✅ CORRECTION: Construire l'URL complète du logo
        String logoPath = cabinet.getLogo();
        if (logoPath != null && !logoPath.isEmpty()) {
            // Si le chemin commence déjà par http, le garder tel quel
            if (logoPath.startsWith("http")) {
                dto.setLogo(logoPath);
            } else {
                // Sinon, construire l'URL complète
                // Si le chemin ne commence pas par /, l'ajouter
                String cleanPath = logoPath.startsWith("/") ? logoPath : "/" + logoPath;
                dto.setLogo(baseUrl + cleanPath);
            }
            System.out.println("🖼️ [Cabinet] URL logo construite: " + dto.getLogo());
        } else {
            dto.setLogo(null);
            System.out.println("⚠️ [Cabinet] Pas de logo défini");
        }

        dto.setMedecinNom(user.getNom() + " " + user.getPrenom());

        return dto;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CabinetDTO> getCabinetById(@PathVariable Integer id) {
        CabinetDTO cabinet = cabinetService.getCabinetById(id);
        return ResponseEntity.ok(cabinet);
    }

    @PostMapping
    public ResponseEntity<CabinetDTO> createCabinet(@RequestBody CabinetDTO cabinetDTO) {
        CabinetDTO createdCabinet = cabinetService.createCabinet(cabinetDTO);
        return ResponseEntity.ok(createdCabinet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CabinetDTO> updateCabinet(@PathVariable Integer id, @RequestBody CabinetDTO cabinetDTO) {
        CabinetDTO updatedCabinet = cabinetService.updateCabinet(id, cabinetDTO);
        return ResponseEntity.ok(updatedCabinet);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCabinet(@PathVariable Integer id) {
        cabinetService.deleteCabinet(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<CabinetStatsDTO> getCabinetStats(@PathVariable Integer id) {
        CabinetStatsDTO stats = cabinetService.getCabinetStats(id);
        return ResponseEntity.ok(stats);
    }
}