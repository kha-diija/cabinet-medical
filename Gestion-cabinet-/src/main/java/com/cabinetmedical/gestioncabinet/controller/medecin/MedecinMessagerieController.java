package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MedecinMessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.SecretaireDisponibleDTO;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.medecin.MedecinMessagerieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/medecin/messagerie")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasAuthority('ROLE_MEDECIN')")
public class MedecinMessagerieController {

    private final MedecinMessagerieService messagerieService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Envoyer un message texte
     */
    @PostMapping
    public ResponseEntity<MedecinMessagerieDTO> envoyerMessage(@RequestBody MedecinMessagerieDTO dto) {
        try {
            log.info("📤 [Controller] Envoi message");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            MedecinMessagerieDTO saved = messagerieService.envoyerMessage(dto, null, medecin.getId());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            log.error("❌ Erreur envoi message: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Envoyer un message avec pièce jointe
     */
    @PostMapping("/avec-fichier")
    public ResponseEntity<MedecinMessagerieDTO> envoyerMessageAvecFichier(
            @RequestPart("message") MedecinMessagerieDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            log.info("📎 [Controller] Envoi message avec fichier");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            MedecinMessagerieDTO saved = messagerieService.envoyerMessage(dto, file, medecin.getId());
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            log.error("❌ Erreur envoi message avec fichier: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Messages reçus (paginés)
     */
    @GetMapping("/recus")
    public ResponseEntity<Page<MedecinMessagerieDTO>> getMessagesRecus(Pageable pageable) {
        try {
            log.info("📥 [Controller] Récupération messages reçus");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Page<MedecinMessagerieDTO> messages = messagerieService.getMessagesRecus(pageable, medecin.getId());
            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            log.error("❌ Erreur récupération messages reçus: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Messages envoyés (paginés)
     */
    @GetMapping("/envoyes")
    public ResponseEntity<Page<MedecinMessagerieDTO>> getMessagesEnvoyes(Pageable pageable) {
        try {
            log.info("📤 [Controller] Récupération messages envoyés");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Page<MedecinMessagerieDTO> messages = messagerieService.getMessagesEnvoyes(pageable, medecin.getId());
            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            log.error("❌ Erreur récupération messages envoyés: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Message par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MedecinMessagerieDTO> getMessageById(@PathVariable Integer id) {
        try {
            log.info("🔍 [Controller] Récupération message ID: {}", id);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            MedecinMessagerieDTO message = messagerieService.getMessageById(id, medecin.getId());
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("❌ Erreur récupération message: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marquer comme lu
     */
    @PatchMapping("/{id}/marquer-lu")
    public ResponseEntity<MedecinMessagerieDTO> marquerCommeLu(@PathVariable Integer id) {
        try {
            log.info("✅ [Controller] Marquage lu message ID: {}", id);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            MedecinMessagerieDTO message = messagerieService.marquerCommeLu(id, medecin.getId());
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("❌ Erreur marquage lu: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Compter messages non lus
     */
    @GetMapping("/non-lus/count")
    public ResponseEntity<Long> countMessagesNonLus() {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            Long count = messagerieService.countMessagesNonLus(medecin.getId());
            return ResponseEntity.ok(count);

        } catch (Exception e) {
            log.error("❌ Erreur comptage messages: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Supprimer message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Integer id) {
        try {
            log.info("🗑️ [Controller] Suppression message ID: {}", id);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            messagerieService.supprimerMessage(id, medecin.getId());
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("❌ Erreur suppression message: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Conversation avec un utilisateur
     */
    @GetMapping("/conversation/{utilisateurId}")
    public ResponseEntity<List<MedecinMessagerieDTO>> getConversation(@PathVariable Integer utilisateurId) {
        try {
            log.info("💬 [Controller] Récupération conversation avec: {}", utilisateurId);

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<MedecinMessagerieDTO> messages = messagerieService.getConversation(utilisateurId, medecin.getId());
            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            log.error("❌ Erreur récupération conversation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Liste des secrétaires disponibles
     */
    @GetMapping("/secretaires")
    public ResponseEntity<List<SecretaireDisponibleDTO>> getSecretairesDisponibles() {
        try {
            log.info("👥 [Controller] Récupération secrétaires disponibles");

            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<SecretaireDisponibleDTO> secretaires = messagerieService.getSecretairesDisponibles(medecin.getId());
            return ResponseEntity.ok(secretaires);

        } catch (Exception e) {
            log.error("❌ Erreur récupération secrétaires: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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