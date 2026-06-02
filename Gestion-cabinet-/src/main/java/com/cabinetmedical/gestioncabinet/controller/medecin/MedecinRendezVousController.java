package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.RendezVousDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.StatistiquesDTO;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.RendezVousMedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/medecin/rendez-vous")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasAuthority('ROLE_MEDECIN')")
public class MedecinRendezVousController {

    private final RendezVousMedRepository rendezVousMedRepository;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/aujourdhui")
    public ResponseEntity<?> getRendezVousAujourdhui() {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            LocalDate aujourdhui = LocalDate.now();
            List<RendezVous> rendezVous = rendezVousMedRepository.findByMedecinAndDate(medecin.getId(), aujourdhui);

            List<RendezVousDTO> dtos = rendezVous.stream()
                    .map(RendezVousDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("❌ Erreur récupération rendez-vous aujourd'hui: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/par-date")
    public ResponseEntity<?> getRendezVousParDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            List<RendezVous> rendezVous = rendezVousMedRepository.findByMedecinAndDate(medecin.getId(), date);

            List<RendezVousDTO> dtos = rendezVous.stream()
                    .map(RendezVousDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("❌ Erreur récupération rendez-vous par date: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/semaine")
    public ResponseEntity<?> getRendezVousSemaine(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut) {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            LocalDate dateFin = dateDebut.plusDays(6);

            List<RendezVous> rendezVous = rendezVousMedRepository.findByMedecinAndDateBetween(
                    medecin.getId(), dateDebut, dateFin);

            List<RendezVousDTO> dtos = rendezVous.stream()
                    .map(RendezVousDTO::fromEntity)
                    .collect(Collectors.toList());

            Map<LocalDate, List<RendezVousDTO>> rendezVousParJour = dtos.stream()
                    .collect(Collectors.groupingBy(RendezVousDTO::getDateRdv));

            Map<String, Object> response = new HashMap<>();
            response.put("rendezVous", dtos);
            response.put("groupes", rendezVousParJour);
            response.put("dateDebut", dateDebut);
            response.put("dateFin", dateFin);
            response.put("total", dtos.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur récupération rendez-vous semaine: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statistiques/aujourdhui")
    public ResponseEntity<?> getStatistiquesAujourdhui() {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            LocalDate aujourdhui = LocalDate.now();
            Integer medecinId = medecin.getId();

            long total = rendezVousMedRepository.countByMedecinAndDate(medecinId, aujourdhui);
            long confirmes = rendezVousMedRepository.countByMedecinAndDateAndStatut(
                    medecinId, aujourdhui, RendezVous.Statut.CONFIRME);
            long enAttente = rendezVousMedRepository.countByMedecinAndDateAndStatut(
                    medecinId, aujourdhui, RendezVous.Statut.EN_ATTENTE);
            long annules = rendezVousMedRepository.findTodayAnnulesByMedecinId(medecinId).size();
            long termines = rendezVousMedRepository.findTodayTerminesByMedecinId(medecinId).size();

            StatistiquesDTO stats = new StatistiquesDTO(
                    total, confirmes, enAttente, annules, termines
            );

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Erreur récupération statistiques: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> changerStatutRendezVous(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            RendezVous rendezVous = rendezVousMedRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé avec ID: " + id));

            // Vérifier que le rendez-vous appartient au médecin connecté
            if (!rendezVous.getMedecin().getId().equals(medecin.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Non autorisé"));
            }

            try {
                RendezVous.Statut nouveauStatut = RendezVous.Statut.valueOf(request.get("statut"));
                rendezVous.setStatut(nouveauStatut);
                rendezVousMedRepository.save(rendezVous);

                return ResponseEntity.ok(Map.of(
                        "message", "Statut mis à jour avec succès",
                        "rendezVous", RendezVousDTO.fromEntity(rendezVous)
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide"));
            }

        } catch (Exception e) {
            log.error("❌ Erreur changement statut rendez-vous: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur serveur"));
        }
    }

    @PutMapping("/{id}/patient-arrive")
    public ResponseEntity<?> marquerPatientArrive(@PathVariable Integer id) {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            RendezVous rendezVous = rendezVousMedRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));

            // Vérifier que le rendez-vous appartient au médecin connecté
            if (!rendezVous.getMedecin().getId().equals(medecin.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Non autorisé"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Patient marqué comme arrivé");
            response.put("rendezVousId", id);
            response.put("patientArrive", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erreur marquage patient arrivé: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur serveur"));
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Utilisateur medecin = getCurrentUtilisateur();
            if (medecin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            LocalDate aujourdhui = LocalDate.now();
            LocalDate demain = aujourdhui.plusDays(1);
            Integer medecinId = medecin.getId();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAujourdhui",
                    rendezVousMedRepository.countByMedecinAndDate(medecinId, aujourdhui));
            stats.put("confirmesAujourdhui",
                    rendezVousMedRepository.findTodayConfirmesByMedecinId(medecinId).size());
            stats.put("enAttenteAujourdhui",
                    rendezVousMedRepository.findTodayEnAttenteByMedecinId(medecinId).size());
            stats.put("annulesAujourdhui",
                    rendezVousMedRepository.findTodayAnnulesByMedecinId(medecinId).size());
            stats.put("terminesAujourdhui",
                    rendezVousMedRepository.findTodayTerminesByMedecinId(medecinId).size());

            // Rendez-vous de demain
            List<RendezVous> rdvDemain = rendezVousMedRepository.findByMedecinAndDate(medecinId, demain);
            stats.put("rendezVousDemain", rdvDemain.size());

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Erreur récupération stats dashboard: ", e);
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