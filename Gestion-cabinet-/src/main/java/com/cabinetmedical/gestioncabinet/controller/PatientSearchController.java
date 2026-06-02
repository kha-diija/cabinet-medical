package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.PatientRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/secretaire/patients")
@RequiredArgsConstructor
public class PatientSearchController {

    private final PatientRepository patientRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * ✅ Recherche de patients pour les notifications
     * Endpoint: GET /api/secretaire/patients/search?q=search_term
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchPatients(
            @RequestParam String q,
            Authentication authentication) {

        // Récupérer l'utilisateur connecté
        Utilisateur secretaire = utilisateurRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier que l'utilisateur a un cabinet
        if (secretaire.getCabinet() == null) {
            return ResponseEntity.ok(List.of());
        }

        // Rechercher les patients
        List<Patient> patients = patientRepository.searchPatients(
                secretaire.getCabinet().getId(),
                q.trim()
        );

        // Convertir en DTO simple pour éviter les références circulaires
        List<Map<String, Object>> result = patients.stream()
                .limit(10) // Limiter à 10 résultats
                .map(patient -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", patient.getId());
                    dto.put("nom", patient.getNom());
                    dto.put("prenom", patient.getPrenom());
                    dto.put("cin", patient.getCin());
                    dto.put("dateNaissance", patient.getDateNaissance());
                    dto.put("numTel", patient.getNumTel());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}