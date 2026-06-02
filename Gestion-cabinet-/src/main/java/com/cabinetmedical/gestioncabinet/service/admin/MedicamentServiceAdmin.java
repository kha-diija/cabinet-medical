package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.model.Medicament;
import com.cabinetmedical.gestioncabinet.repository.admin.MedicamentRepositoryAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicamentServiceAdmin {

    private final MedicamentRepositoryAdmin medicamentRepositoryAdmin;

    // Créer un médicament
    @Transactional
    public Medicament creerMedicament(Medicament medicament) {
        medicament.setDateAjout(LocalDateTime.now());
        medicament.setActif(true);
        return medicamentRepositoryAdmin.save(medicament);
    }

    // Modifier un médicament
    @Transactional
    public Medicament modifierMedicament(Integer id, Medicament medicamentData) {
        Medicament medicament = medicamentRepositoryAdmin.findById(id)
                .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));

        medicament.setNom(medicamentData.getNom());
        medicament.setForme(medicamentData.getForme());
        medicament.setDosage(medicamentData.getDosage());
        medicament.setDci(medicamentData.getDci());
        medicament.setLaboratoire(medicamentData.getLaboratoire());

        return medicamentRepositoryAdmin.save(medicament);
    }

    // Supprimer (soft delete)
    @Transactional
    public void supprimerMedicament(Integer id) {
        Medicament medicament = medicamentRepositoryAdmin.findById(id)
                .orElseThrow(() -> new RuntimeException("Médicament non trouvé"));
        medicament.setActif(false);
        medicamentRepositoryAdmin.save(medicament);
    }

    // Supprimer définitivement
    @Transactional
    public void supprimerDefinitivement(Integer id) {
        medicamentRepositoryAdmin.deleteById(id);
    }

    // Récupérer tous les médicaments actifs
    public List<Medicament> getAllMedicaments() {
        return medicamentRepositoryAdmin.findByActifTrue();
    }

    // Rechercher des médicaments (pour filtres)
    public List<Medicament> rechercherMedicaments(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllMedicaments();
        }
        return medicamentRepositoryAdmin.searchMedicaments(search);
    }

    // Autocomplétion pour le médecin
    public List<Medicament> autocompletion(String nom) {
        return medicamentRepositoryAdmin.findByNomContainingIgnoreCaseAndActifTrue(nom);
    }

    // IMPORT CSV
    @Transactional
    public ImportResult importerCSV(MultipartFile file) {
        List<Medicament> medicamentsAjoutes = new ArrayList<>();
        List<String> erreurs = new ArrayList<>();
        int ligneNum = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                ligneNum++;

                // Ignorer l'en-tête
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                try {
                    String[] data = line.split(",");

                    if (data.length < 3) {
                        erreurs.add("Ligne " + ligneNum + ": format invalide");
                        continue;
                    }

                    Medicament medicament = new Medicament();
                    medicament.setNom(data[0].trim());
                    medicament.setDosage(data[1].trim());
                    medicament.setForme(data[2].trim());

                    if (data.length > 3) medicament.setDci(data[3].trim());
                    if (data.length > 4) medicament.setLaboratoire(data[4].trim());

                    medicament.setActif(true);
                    medicament.setDateAjout(LocalDateTime.now());

                    Medicament saved = medicamentRepositoryAdmin.save(medicament);
                    medicamentsAjoutes.add(saved);

                } catch (Exception e) {
                    erreurs.add("Ligne " + ligneNum + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier: " + e.getMessage());
        }

        return new ImportResult(medicamentsAjoutes.size(), erreurs);
    }

    // Classe pour le résultat d'import
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ImportResult {
        private int nombreAjoutes;
        private List<String> erreurs;
    }
}