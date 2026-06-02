package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.PatientDTO;
import com.cabinetmedical.gestioncabinet.dto.PatientSearchDTO;
import com.cabinetmedical.gestioncabinet.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/secretaire/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
//@PreAuthorize("hasRole('SECRETAIRE')")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestBody PatientDTO patientDTO) {
        PatientDTO created = patientService.createPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientDTO patientDTO) {
        PatientDTO updated = patientService.updatePatient(id, patientDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Integer id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    public ResponseEntity<Page<PatientDTO>> getAllPatients(Pageable pageable) {
        Page<PatientDTO> patients = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/search/cin/{cin}")
    public ResponseEntity<PatientDTO> searchByCin(@PathVariable String cin) {
        PatientDTO patient = patientService.findByCin(cin);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/search/nom")
    public ResponseEntity<List<PatientDTO>> searchByNom(
            @RequestParam String nom,
            @RequestParam(required = false) String prenom) {
        List<PatientDTO> patients = patientService.searchByNomPrenom(nom, prenom);
        return ResponseEntity.ok(patients);
    }

    @PostMapping("/search")
    public ResponseEntity<List<PatientDTO>> advancedSearch(@RequestBody PatientSearchDTO searchDTO) {
        List<PatientDTO> patients = patientService.advancedSearch(searchDTO);
        return ResponseEntity.ok(patients);
    }

    @PostMapping("/{patientId}/envoyer-medecin/{medecinId}")
    public ResponseEntity<String> envoyerPatientAuMedecin(
            @PathVariable Integer patientId,
            @PathVariable Integer medecinId) {
        patientService.envoyerPatientAuMedecin(patientId, medecinId);
        return ResponseEntity.ok("Patient envoyé au médecin avec succès");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}