package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.ChangePasswordDTO;
import com.cabinetmedical.gestioncabinet.dto.ProfileDTO;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/utilisateur")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    /**
     * ✅ Récupère le profil de l'utilisateur connecté
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = utilisateurService.findByLogin(userDetails.getUsername());

        ProfileDTO profile = new ProfileDTO(
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getLogin(),
                utilisateur.getNumTel()
        );

        return ResponseEntity.ok(profile);
    }

    /**
     * ✅ Met à jour le profil de l'utilisateur - RETOURNE UN DTO, PAS UNE ENTITÉ
     */
    @PutMapping("/profile")
    public ResponseEntity<ProfileDTO> updateProfile(
            @RequestBody ProfileDTO profileDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Mettre à jour l'utilisateur
        Utilisateur utilisateur = utilisateurService.updateProfile(userDetails.getUsername(), profileDTO);

        // ✅ IMPORTANT : Retourner un DTO, pas l'entité directement !
        ProfileDTO updatedProfile = new ProfileDTO(
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getLogin(),
                utilisateur.getNumTel()
        );

        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Change le mot de passe
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody ChangePasswordDTO passwordDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        utilisateurService.changePassword(userDetails.getUsername(), passwordDTO);
        return ResponseEntity.ok().build();
    }
}