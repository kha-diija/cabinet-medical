package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.ConsultationDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.ConsultationRequestDTO;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.medecin.ConsultationMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.RendezVousMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.DossierMedicalMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cabinetmedical.gestioncabinet.exception.medecin.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationService {

    private final ConsultationMedRepository consultationMedRepository;
    private final RendezVousMedRepository rendezVousMedRepository;
    private final DossierMedicalMedRepository dossierMedicalMedRepository;
    private final UtilisateurmedRepository utilisateurRepository;

    @Transactional(readOnly = true)
    public List<ConsultationDTO> getPatientConsultationHistoryById(Integer patientId, Integer medecinId) {
        try {
            log.info("📋 Récupération historique - Patient: {}, Médecin: {}", patientId, medecinId);

            List<Consultation> consultations = consultationMedRepository.findByPatientAndMedecin(
                    patientId,
                    medecinId
            );

            log.info("✅ {} consultations trouvées", consultations.size());

            return consultations.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erreur récupération historique: ", e);
            throw new RuntimeException("Erreur lors de la récupération de l'historique", e);
        }
    }

    @Transactional
    public ConsultationDTO createConsultation(ConsultationRequestDTO requestDTO, Integer medecinId, Integer cabinetId) {
        try {
            log.info("=== DEBUT createConsultation ===");
            log.info("Médecin ID: {}, Cabinet ID: {}", medecinId, cabinetId);
            log.info("Request DTO: {}", requestDTO);
            log.info("🔍 Recherche RDV EN_COURS pour médecin {}", medecinId);

            // 1. Trouver le rendez-vous EN_COURS pour ce médecin
            List<RendezVous> rdvEnCours = rendezVousMedRepository.findByMedecinIdAndStatut(
                    medecinId,
                    RendezVous.Statut.EN_COURS
            );
            log.info("📊 Nombre de RDV EN_COURS trouvés: {}", rdvEnCours.size());

            if (rdvEnCours.isEmpty()) {
                log.error("❌ Aucun rendez-vous EN_COURS trouvé pour médecin {}", medecinId);
                throw new RuntimeException("Aucun patient en cours. Veuillez démarrer une consultation depuis le dashboard.");
            }

            RendezVous rendezVous = rdvEnCours.get(0);
            log.info("✅ RDV trouvé - ID: {}, Patient: {}",
                    rendezVous.getIdRendezVous(),
                    rendezVous.getPatient() != null ?
                            rendezVous.getPatient().getNom() + " " + rendezVous.getPatient().getPrenom() :
                            "null");
            Patient patient = rendezVous.getPatient();
            log.info("✅ Patient EN_COURS trouvé: {} {} (ID: {})",
                    patient.getNom(), patient.getPrenom(), patient.getId());
            log.info("✅ Patient EN_COURS trouvé: {} {} (ID: {})",
                    patient.getNom(), patient.getPrenom(), patient.getId());

            // 2. Vérifier si une consultation existe déjà pour ce rendez-vous
            Optional<Consultation> existingConsultation = consultationMedRepository
                    .findByRendezVousId(rendezVous.getIdRendezVous());

            if (existingConsultation.isPresent()) {
                log.warn("⚠️ Consultation déjà existante pour RDV {}", rendezVous.getIdRendezVous());
                throw new ConsultationAlreadyExistsException("Une consultation existe déjà pour ce rendez-vous. Une seule consultation est autorisée par rendez-vous.");
            }

            // 3. Récupérer ou créer le dossier médical
            DossierMedical dossier = patient.getDossierMedical();
            if (dossier == null) {
                log.info("📁 Création nouveau dossier médical");
                dossier = new DossierMedical();
                dossier.setPatient(patient);
                dossier.setDateCreation(LocalDate.now());
                dossier = dossierMedicalMedRepository.save(dossier);
            }

            // 4. Récupérer le médecin
            Utilisateur medecin = utilisateurRepository.findById(medecinId)
                    .orElseThrow(() -> new RuntimeException("Médecin non trouvé: " + medecinId));

            // 5. Créer la consultation
            Consultation consultation = new Consultation();
            consultation.setType(requestDTO.getType());
            consultation.setDateConsultation(requestDTO.getDateConsultation() != null
                    ? requestDTO.getDateConsultation()
                    : LocalDate.now());
            consultation.setExamenClinique(requestDTO.getExamenClinique());
            consultation.setExamenSupplementaire(requestDTO.getExamenSupplementaire());
            consultation.setDiagnostic(requestDTO.getDiagnostic());
            consultation.setTraitement(requestDTO.getTraitement());
            consultation.setObservations(requestDTO.getObservations());
            consultation.setPatient(patient);
            consultation.setMedecin(medecin);
            consultation.setDossier(dossier);
            consultation.setRendezVous(rendezVous);

            // 6. Sauvegarder
            Consultation savedConsultation = consultationMedRepository.save(consultation);
            log.info("✅ Consultation créée (ID: {})", savedConsultation.getIdConsultation());

            return toDTO(savedConsultation);

        } catch (ConsultationAlreadyExistsException e) {
            log.error("❌ Consultation déjà existante: ", e);
            throw e; // Relancer l'exception spécifique
        } catch (Exception e) {
            log.error("❌ Erreur création consultation: ", e);
            throw new RuntimeException("Erreur lors de la création: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ConsultationDTO updateConsultation(Integer consultationId, ConsultationRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("📝 Mise à jour consultation {} par médecin {}", consultationId, medecinId);

            Consultation consultation = consultationMedRepository.findByIdAndMedecin(consultationId, medecinId)
                    .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));

            consultation.setType(requestDTO.getType());
            consultation.setExamenClinique(requestDTO.getExamenClinique());
            consultation.setExamenSupplementaire(requestDTO.getExamenSupplementaire());
            consultation.setDiagnostic(requestDTO.getDiagnostic());
            consultation.setTraitement(requestDTO.getTraitement());
            consultation.setObservations(requestDTO.getObservations());

            if (requestDTO.getDateConsultation() != null) {
                consultation.setDateConsultation(requestDTO.getDateConsultation());
            }

            Consultation updatedConsultation = consultationMedRepository.save(consultation);
            log.info("✅ Consultation mise à jour");

            return toDTO(updatedConsultation);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour: ", e);
            throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ConsultationDTO getConsultationById(Integer consultationId, Integer medecinId) {
        Consultation consultation = consultationMedRepository.findByIdAndMedecin(consultationId, medecinId)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        return toDTO(consultation);
    }

    private ConsultationDTO toDTO(Consultation consultation) {
        ConsultationDTO dto = new ConsultationDTO();
        dto.setIdConsultation(consultation.getIdConsultation());
        dto.setType(consultation.getType());
        dto.setDateConsultation(consultation.getDateConsultation());
        dto.setExamenClinique(consultation.getExamenClinique());
        dto.setExamenSupplementaire(consultation.getExamenSupplementaire());
        dto.setDiagnostic(consultation.getDiagnostic());
        dto.setTraitement(consultation.getTraitement());
        dto.setObservations(consultation.getObservations());
        dto.setDateCreation(consultation.getDateCreation());

        if (consultation.getPatient() != null) {
            dto.setIdPatient(consultation.getPatient().getId());
            dto.setPatientNom(consultation.getPatient().getNom());
            dto.setPatientPrenom(consultation.getPatient().getPrenom());
            dto.setPatientCin(consultation.getPatient().getCin());
        }

        if (consultation.getMedecin() != null) {
            dto.setIdMedecin(consultation.getMedecin().getId());
            dto.setMedecinNom(consultation.getMedecin().getNom());
            dto.setMedecinPrenom(consultation.getMedecin().getPrenom());
        }

        return dto;
    }
}