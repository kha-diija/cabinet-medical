package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.DossierMedicalDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.DossierMedicalRequestDTO;
import com.cabinetmedical.gestioncabinet.model.DossierMedical;
import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.model.RendezVous;
import com.cabinetmedical.gestioncabinet.repository.medecin.DossierMedicalMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.RendezVousMedRepository;
import com.cabinetmedical.gestioncabinet.repository.PatientRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DossierMedicalService {

    private final DossierMedicalMedRepository dossierMedicalMedRepository;
    private final RendezVousMedRepository rendezVousMedRepository;
    private final PatientRepository patientRepository;

    /**
     * Récupérer le dossier médical du patient en cours
     */
    @Transactional(readOnly = true)
    public DossierMedicalDTO getDossierMedicalForCurrentPatient(Integer medecinId) {
        try {
            log.info("📋 Récupération dossier médical - Médecin: {}", medecinId);

            // 1. Trouver le rendez-vous EN_COURS
            List<RendezVous> rdvEnCours = rendezVousMedRepository.findByMedecinIdAndStatut(
                    medecinId,
                    RendezVous.Statut.EN_COURS
            );

            if (rdvEnCours.isEmpty()) {
                log.warn("⚠️ Aucun rendez-vous EN_COURS trouvé pour médecin {}", medecinId);
                return null;
            }

            RendezVous rendezVous = rdvEnCours.get(0);
            Patient patient = rendezVous.getPatient();

            log.info("✅ Patient EN_COURS trouvé: {} {} (ID: {})",
                    patient.getNom(), patient.getPrenom(), patient.getId());

            // 2. Chercher le dossier médical existant
            DossierMedical dossier = patient.getDossierMedical();

            if (dossier == null) {
                log.info("📝 Aucun dossier médical existant pour patient {}", patient.getId());
                // Retourner un DTO avec uniquement les infos du patient
                return createEmptyDossierDTO(patient);
            }

            log.info("✅ Dossier médical trouvé (ID: {})", dossier.getIdDossier());
            return toDTO(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur récupération dossier médical: ", e);
            throw new RuntimeException("Erreur lors de la récupération du dossier médical", e);
        }
    }

    /**
     * Créer un nouveau dossier médical pour le patient EN_COURS
     */
    @Transactional
    public DossierMedicalDTO createDossierMedical(DossierMedicalRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("=== DEBUT createDossierMedical ===");
            log.info("Médecin ID: {}", medecinId);
            log.info("Request DTO: {}", requestDTO);

            // 1. Trouver le rendez-vous EN_COURS
            List<RendezVous> rdvEnCours = rendezVousMedRepository.findByMedecinIdAndStatut(
                    medecinId,
                    RendezVous.Statut.EN_COURS
            );

            if (rdvEnCours.isEmpty()) {
                log.error("❌ Aucun rendez-vous EN_COURS trouvé pour médecin {}", medecinId);
                throw new RuntimeException("Aucun patient en cours. Veuillez démarrer une consultation depuis le dashboard.");
            }

            RendezVous rendezVous = rdvEnCours.get(0);
            Patient patient = rendezVous.getPatient();

            log.info("✅ Patient EN_COURS trouvé: {} {} (ID: {})",
                    patient.getNom(), patient.getPrenom(), patient.getId());

            // 2. Vérifier si un dossier existe déjà
            if (patient.getDossierMedical() != null) {
                log.warn("⚠️ Un dossier médical existe déjà pour ce patient");
                throw new RuntimeException("Un dossier médical existe déjà pour ce patient. Utilisez la mise à jour.");
            }

            // 3. Créer le nouveau dossier médical
            DossierMedical dossier = new DossierMedical();
            dossier.setPatient(patient);
            dossier.setDateCreation(LocalDate.now());
            dossier.setAntMedicaux(requestDTO.getAntMedicaux());
            dossier.setAntChirug(requestDTO.getAntChirug());
            dossier.setAllergies(requestDTO.getAllergies());
            dossier.setTraitement(requestDTO.getTraitement());
            dossier.setHabitudes(requestDTO.getHabitudes());

            // 4. Sauvegarder
            DossierMedical savedDossier = dossierMedicalMedRepository.save(dossier);
            log.info("✅ Dossier médical créé (ID: {})", savedDossier.getIdDossier());

            return toDTO(savedDossier);

        } catch (Exception e) {
            log.error("❌ Erreur création dossier médical: ", e);
            throw new RuntimeException("Erreur lors de la création: " + e.getMessage(), e);
        }
    }

    /**
     * Mettre à jour le dossier médical du patient EN_COURS
     */
    @Transactional
    public DossierMedicalDTO updateDossierMedical(DossierMedicalRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("📝 Mise à jour dossier médical par médecin {}", medecinId);

            // 1. Trouver le rendez-vous EN_COURS
            List<RendezVous> rdvEnCours = rendezVousMedRepository.findByMedecinIdAndStatut(
                    medecinId,
                    RendezVous.Statut.EN_COURS
            );

            if (rdvEnCours.isEmpty()) {
                throw new RuntimeException("Aucun patient en cours");
            }

            Patient patient = rdvEnCours.get(0).getPatient();
            DossierMedical dossier = patient.getDossierMedical();

            if (dossier == null) {
                log.warn("⚠️ Aucun dossier médical existant, création automatique");
                return createDossierMedical(requestDTO, medecinId);
            }

            // 2. Mettre à jour les champs
            dossier.setAntMedicaux(requestDTO.getAntMedicaux());
            dossier.setAntChirug(requestDTO.getAntChirug());
            dossier.setAllergies(requestDTO.getAllergies());
            dossier.setTraitement(requestDTO.getTraitement());
            dossier.setHabitudes(requestDTO.getHabitudes());

            DossierMedical updatedDossier = dossierMedicalMedRepository.save(dossier);
            log.info("✅ Dossier médical mis à jour (ID: {})", updatedDossier.getIdDossier());

            return toDTO(updatedDossier);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour dossier médical: ", e);
            throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
        }
    }

    /**
     * Récupérer un dossier médical spécifique par patient ID
     */
    @Transactional(readOnly = true)
    public DossierMedicalDTO getDossierMedicalByPatientId(Integer patientId, Integer cabinetId) {
        try {
            log.info("📋 Récupération dossier médical - Patient: {}, Cabinet: {}", patientId, cabinetId);

            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

            // Vérifier que le patient appartient au bon cabinet
            if (patient.getCabinet() == null || !patient.getCabinet().getId().equals(cabinetId)) {
                throw new RuntimeException("Accès non autorisé à ce patient");
            }

            DossierMedical dossier = patient.getDossierMedical();

            if (dossier == null) {
                log.info("📝 Aucun dossier médical pour patient {}", patientId);
                return createEmptyDossierDTO(patient);
            }

            return toDTO(dossier);

        } catch (Exception e) {
            log.error("❌ Erreur récupération dossier: ", e);
            throw new RuntimeException("Erreur lors de la récupération: " + e.getMessage(), e);
        }
    }

    /**
     * Convertir DossierMedical en DTO
     */
    private DossierMedicalDTO toDTO(DossierMedical dossier) {
        DossierMedicalDTO dto = new DossierMedicalDTO();
        dto.setIdDossier(dossier.getIdDossier());
        dto.setAntMedicaux(dossier.getAntMedicaux());
        dto.setAntChirug(dossier.getAntChirug());
        dto.setAllergies(dossier.getAllergies());
        dto.setTraitement(dossier.getTraitement());
        dto.setHabitudes(dossier.getHabitudes());
        dto.setDateCreation(dossier.getDateCreation());

        if (dossier.getPatient() != null) {
            Patient patient = dossier.getPatient();
            dto.setIdPatient(patient.getId());
            dto.setPatientNom(patient.getNom());
            dto.setPatientPrenom(patient.getPrenom());
            dto.setPatientCin(patient.getCin());
            dto.setPatientDateNaissance(patient.getDateNaissance());
            dto.setPatientSexe(patient.getSexe().name());
            dto.setPatientTel(patient.getNumTel());
        }

        return dto;
    }

    /**
     * Créer un DTO vide avec seulement les infos patient
     */
    private DossierMedicalDTO createEmptyDossierDTO(Patient patient) {
        DossierMedicalDTO dto = new DossierMedicalDTO();
        dto.setIdPatient(patient.getId());
        dto.setPatientNom(patient.getNom());
        dto.setPatientPrenom(patient.getPrenom());
        dto.setPatientCin(patient.getCin());
        dto.setPatientDateNaissance(patient.getDateNaissance());
        dto.setPatientSexe(patient.getSexe().name());
        dto.setPatientTel(patient.getNumTel());
        return dto;
    }
}