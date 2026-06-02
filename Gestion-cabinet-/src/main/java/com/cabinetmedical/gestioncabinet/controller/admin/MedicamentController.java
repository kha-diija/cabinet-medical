package com.cabinetmedical.gestioncabinet.controller.admin;

import com.cabinetmedical.gestioncabinet.model.Medicament;
import com.cabinetmedical.gestioncabinet.service.admin.MedicamentServiceAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicamentController {

    private final MedicamentServiceAdmin medicamentServiceAdmin;

    // CRUD - Réservé à l'ADMINISTRATEUR
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<Medicament> creerMedicament(@RequestBody Medicament medicament) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicamentServiceAdmin.creerMedicament(medicament));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<Medicament> modifierMedicament(
            @PathVariable Integer id,
            @RequestBody Medicament medicament) {
        return ResponseEntity.ok(medicamentServiceAdmin.modifierMedicament(id, medicament));
    }

    @DeleteMapping("/{id}")
// IL FAUT AJOUTER "ROLE_" ICI car ApplicationConfig l'ajoute lors de la connexion
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<Void> supprimerMedicament(@PathVariable Integer id) {
        medicamentServiceAdmin.supprimerMedicament(id);
        return ResponseEntity.noContent().build();
    }

    // Liste tous les médicaments (Administrateur + Médecin)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRATEUR', 'ROLE_MEDECIN')")
    public ResponseEntity<List<Medicament>> getAllMedicaments() {
        return ResponseEntity.ok(medicamentServiceAdmin.getAllMedicaments());
    }

    // Recherche avec filtre (Administrateur)
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<List<Medicament>> rechercherMedicaments(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(medicamentServiceAdmin.rechercherMedicaments(search));
    }

    // Autocomplétion pour le médecin
    @GetMapping("/autocomplete")
    @PreAuthorize("hasAuthority('MEDECIN')")
    public ResponseEntity<List<Medicament>> autocompletion(@RequestParam String nom) {
        return ResponseEntity.ok(medicamentServiceAdmin.autocompletion(nom));
    }

    // IMPORT CSV (Administrateur uniquement)
    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<MedicamentServiceAdmin.ImportResult> importerCSV(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (!file.getOriginalFilename().endsWith(".csv")) {
            return ResponseEntity.badRequest().build();
        }

        MedicamentServiceAdmin.ImportResult result = medicamentServiceAdmin.importerCSV(file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<byte[]> exporterCSV() {
        List<Medicament> medicaments = medicamentServiceAdmin.getAllMedicaments(); // seuls actifs

        // Construction du CSV
        StringBuilder csv = new StringBuilder();
        csv.append("Nom,Forme,Dosage,Laboratoire,DCI\n");

        for (Medicament m : medicaments) {
            // Remplacer les null par vide et échapper les virgules éventuelles
            String nom = m.getNom() != null ? m.getNom().replace(",", " ") : "";
            String forme = m.getForme() != null ? m.getForme().replace(",", " ") : "";
            String dosage = m.getDosage() != null ? m.getDosage().replace(",", " ") : "";
            String laboratoire = m.getLaboratoire() != null ? m.getLaboratoire().replace(",", " ") : "";
            String dci = m.getDci() != null ? m.getDci().replace(",", " ") : "";

            csv.append(String.format("%s,%s,%s,%s,%s\n", nom, forme, dosage, laboratoire, dci));
        }

        // Ajouter BOM pour Excel
        byte[] bom = {(byte)0xEF, (byte)0xBB, (byte)0xBF};
        byte[] csvBytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] output = new byte[bom.length + csvBytes.length];
        System.arraycopy(bom, 0, output, 0, bom.length);
        System.arraycopy(csvBytes, 0, output, bom.length, csvBytes.length);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=medicaments.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(output);
    }

}