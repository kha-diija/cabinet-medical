package com.cabinetmedical.gestioncabinet.controller.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.PatientDTO;
import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.service.medecin.PatientmedService;
import com.cabinetmedical.gestioncabinet.service.medecin.UtilisateurMedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientmedController {

    private final PatientmedService patientmedService;
    private final UtilisateurMedService utilisateurMedService;

    @GetMapping("/medsearch")
    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<List<PatientDTO>> searchPatients(
            @RequestParam String q,
            Authentication authentication) {

        String username = authentication.getName();
        Utilisateur user = utilisateurMedService.findByLogin(username);

        // Rechercher dans le cabinet de l'utilisateur
        List<Patient> patients = patientmedService.searchPatientsByCabinet(q, user.getCabinet().getId());

        List<PatientDTO> dtos = patients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setCin(patient.getCin());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setSexe(patient.getSexe().name());
        dto.setNumTel(patient.getNumTel());
        dto.setTypeMutuelle(patient.getTypeMutuelle());
        dto.setAdresse(patient.getAdresse());
        dto.setEmail(patient.getEmail());
        dto.setDateCreation(patient.getDateCreation());
        return dto;
    }

    // AJOUTER cette méthode DANS la classe
    @GetMapping("/all")  // ← CHANGEMENT ICI

    @PreAuthorize("hasAuthority('ROLE_MEDECIN')")
    public ResponseEntity<List<PatientDTO>> getAllPatients(Authentication authentication) {
        String username = authentication.getName();
        Utilisateur user = utilisateurMedService.findByLogin(username);

        // Récupérer tous les patients du cabinet
        List<Patient> patients = patientmedService.getAllPatientsByCabinet(user.getCabinet().getId());

        List<PatientDTO> dtos = patients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

}

