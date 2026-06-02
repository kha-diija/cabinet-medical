package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MedicamentDTO;
import com.cabinetmedical.gestioncabinet.model.Medicament;
import com.cabinetmedical.gestioncabinet.repository.medecin.MedicamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicamentService {

    private final MedicamentRepository medicamentRepository;

    /**
     * Rechercher des médicaments par nom ou DCI
     */
    @Transactional(readOnly = true)
    public List<MedicamentDTO> searchMedicaments(String query) {
        try {
            log.info("🔍 Recherche médicaments: {}", query);

            if (query == null || query.trim().isEmpty()) {
                return List.of();
            }

            List<Medicament> medicaments = medicamentRepository.searchByName(query.trim());

            log.info("✅ {} médicaments trouvés", medicaments.size());

            return medicaments.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erreur recherche médicaments: ", e);
            throw new RuntimeException("Erreur lors de la recherche de médicaments", e);
        }
    }

    /**
     * Récupérer tous les médicaments actifs
     */
    @Transactional(readOnly = true)
    public List<MedicamentDTO> getAllMedicaments() {
        try {
            log.info("📋 Récupération tous médicaments actifs");

            List<Medicament> medicaments = medicamentRepository.findAllActive();

            log.info("✅ {} médicaments trouvés", medicaments.size());

            return medicaments.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erreur récupération médicaments: ", e);
            throw new RuntimeException("Erreur lors de la récupération des médicaments", e);
        }
    }

    /**
     * Récupérer un médicament par ID
     */
    @Transactional(readOnly = true)
    public MedicamentDTO getMedicamentById(Integer id) {
        try {
            log.info("🔍 Récupération médicament: {}", id);

            Medicament medicament = medicamentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Médicament non trouvé: " + id));

            return toDTO(medicament);

        } catch (Exception e) {
            log.error("❌ Erreur récupération médicament: ", e);
            throw new RuntimeException("Erreur lors de la récupération du médicament", e);
        }
    }

    /**
     * Convertir Medicament en DTO
     */
    private MedicamentDTO toDTO(Medicament medicament) {
        MedicamentDTO dto = new MedicamentDTO();
        dto.setId(medicament.getId());
        dto.setNom(medicament.getNom());
        dto.setForme(medicament.getForme());
        dto.setDosage(medicament.getDosage());
        dto.setDci(medicament.getDci());
        dto.setLaboratoire(medicament.getLaboratoire());
        dto.setActif(medicament.getActif());
        return dto;
    }
}