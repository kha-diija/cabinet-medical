package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.PatientRepository;
import com.cabinetmedical.gestioncabinet.repository.RendezVousRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/secretaire/rendez-vous")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RendezVousController {

    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/jour")
    public List<Map<String, Object>> getRendezVousDuJour(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<RendezVous> rendezVous = rendezVousRepository.findByDateRdv(targetDate);
        return rendezVous.stream().map(this::mapRendezVousToDto).collect(Collectors.toList());
    }

    @GetMapping
    public List<Map<String, Object>> getAllRendezVous() {
        List<RendezVous> rendezVous = rendezVousRepository.findAll();
        return rendezVous.stream().map(this::mapRendezVousToDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getRendezVousById(@PathVariable Integer id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable"));
        return mapRendezVousToDto(rdv);
    }

    @PostMapping
    public Map<String, Object> createRendezVous(@RequestBody Map<String, Object> rdvData) {
        RendezVous rdv = new RendezVous();

        String dateRdv = (String) rdvData.get("dateRdv");
        String heureRdv = (String) rdvData.get("heureRdv");
        Integer patientId = Integer.parseInt(rdvData.get("patientId").toString());
        Integer medecinId = Integer.parseInt(rdvData.get("medecinId").toString());
        String motifStr = (String) rdvData.get("motif");
        String statutStr = (String) rdvData.get("statut");

        rdv.setDateRdv(LocalDate.parse(dateRdv));
        rdv.setHeureRdv(LocalTime.parse(heureRdv));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient introuvable"));
        rdv.setPatient(patient);

        Utilisateur medecin = utilisateurRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));
        rdv.setMedecin(medecin);

        if (motifStr != null && !motifStr.isEmpty()) {
            rdv.setMotif(RendezVous.Motif.valueOf(motifStr));
        }

        if (statutStr != null && !statutStr.isEmpty()) {
            rdv.setStatut(RendezVous.Statut.valueOf(statutStr));
        }

        RendezVous saved = rendezVousRepository.save(rdv);
        return mapRendezVousToDto(saved);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateRendezVous(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> rdvData
    ) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable"));

        if (rdvData.containsKey("dateRdv")) {
            rdv.setDateRdv(LocalDate.parse((String) rdvData.get("dateRdv")));
        }
        if (rdvData.containsKey("heureRdv")) {
            rdv.setHeureRdv(LocalTime.parse((String) rdvData.get("heureRdv")));
        }
        if (rdvData.containsKey("patientId")) {
            Integer patientId = Integer.parseInt(rdvData.get("patientId").toString());
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient introuvable"));
            rdv.setPatient(patient);
        }
        if (rdvData.containsKey("medecinId")) {
            Integer medecinId = Integer.parseInt(rdvData.get("medecinId").toString());
            Utilisateur medecin = utilisateurRepository.findById(medecinId)
                    .orElseThrow(() -> new RuntimeException("Médecin introuvable"));
            rdv.setMedecin(medecin);
        }
        if (rdvData.containsKey("motif")) {
            String motif = (String) rdvData.get("motif");
            if (motif != null && !motif.isEmpty()) {
                rdv.setMotif(RendezVous.Motif.valueOf(motif));
            }
        }
        if (rdvData.containsKey("statut")) {
            rdv.setStatut(RendezVous.Statut.valueOf((String) rdvData.get("statut")));
        }

        RendezVous updated = rendezVousRepository.save(rdv);
        return mapRendezVousToDto(updated);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteRendezVous(@PathVariable Integer id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable"));

        rendezVousRepository.delete(rdv);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Rendez-vous supprimé avec succès");
        return response;
    }

    @PatchMapping("/{id}/statut")
    public Map<String, Object> updateStatut(
            @PathVariable Integer id,
            @RequestParam String statut
    ) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable"));

        try {
            RendezVous.Statut nouveauStatut = RendezVous.Statut.valueOf(statut);
            rdv.setStatut(nouveauStatut);
            rendezVousRepository.save(rdv);

            return mapRendezVousToDto(rdv);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide: " + statut);
        }
    }

    private Map<String, Object> mapRendezVousToDto(RendezVous rdv) {
        Map<String, Object> rdvMap = new HashMap<>();

        LocalDateTime dateHeure = LocalDateTime.of(rdv.getDateRdv(), rdv.getHeureRdv());

        rdvMap.put("id", rdv.getIdRendezVous());
        rdvMap.put("dateHeure", dateHeure.toString());
        rdvMap.put("statut", rdv.getStatut().toString());
        rdvMap.put("motif", rdv.getMotif() != null ? rdv.getMotif().toString() : "");

        Map<String, Object> patient = new HashMap<>();
        patient.put("id", rdv.getPatient().getIdPatient());
        patient.put("nom", rdv.getPatient().getNom());
        patient.put("prenom", rdv.getPatient().getPrenom());
        patient.put("telephone", rdv.getPatient().getTelephone());
        rdvMap.put("patient", patient);

        Map<String, Object> medecin = new HashMap<>();
        medecin.put("id", rdv.getMedecin().getIdUtilisateur());
        medecin.put("nom", rdv.getMedecin().getNom());
        medecin.put("prenom", rdv.getMedecin().getPrenom());
        rdvMap.put("medecin", medecin);

        return rdvMap;
    }
}