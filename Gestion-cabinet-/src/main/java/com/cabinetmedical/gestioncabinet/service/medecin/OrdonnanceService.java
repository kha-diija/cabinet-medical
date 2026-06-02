package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.*;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.medecin.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final OrdonnanceExamenRepository ordonnanceExamenRepository;
    private final ConsultationMedRepository consultationMedRepository;
    private final RendezVousMedRepository rendezVousMedRepository;

    /**
     * Récupère les ordonnances d'une consultation
     */
    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getOrdonnancesByConsultation(Integer consultationId, Integer medecinId) {
        try {
            log.info("📋 Récupération ordonnances - Consultation: {}, Médecin: {}", consultationId, medecinId);

            // Vérifier que la consultation appartient au médecin
            Consultation consultation = consultationMedRepository.findByIdAndMedecin(consultationId, medecinId)
                    .orElseThrow(() -> new RuntimeException("Consultation non trouvée ou accès non autorisé"));

            List<Ordonnance> ordonnances = ordonnanceRepository.findByConsultationId(consultationId);

            log.info("✅ {} ordonnances trouvées", ordonnances.size());

            return ordonnances.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Erreur récupération ordonnances: ", e);
            throw new RuntimeException("Erreur lors de la récupération des ordonnances", e);
        }
    }

    /**
     * Récupère le patient et la consultation EN_COURS pour le médecin
     */
    @Transactional(readOnly = true)
    public ConsultationDTO getConsultationEnCours(Integer medecinId) {
        try {
            log.info("🔍 Recherche consultation EN_COURS pour médecin {}", medecinId);

            List<RendezVous> rdvEnCours = rendezVousMedRepository.findByMedecinIdAndStatut(
                    medecinId,
                    RendezVous.Statut.EN_COURS
            );

            if (rdvEnCours.isEmpty()) {
                log.warn("⚠️ Aucun rendez-vous EN_COURS pour médecin {}", medecinId);
                return null;
            }

            RendezVous rendezVous = rdvEnCours.get(0);

            // Récupérer la consultation si elle existe
            Consultation consultation = consultationMedRepository.findByRendezVousId(rendezVous.getIdRendezVous())
                    .orElse(null);

            if (consultation == null) {
                log.warn("⚠️ Aucune consultation créée pour le RDV EN_COURS");
                return null;
            }

            log.info("✅ Consultation EN_COURS trouvée: ID {}", consultation.getIdConsultation());

            return toConsultationDTO(consultation);

        } catch (Exception e) {
            log.error("❌ Erreur récupération consultation EN_COURS: ", e);
            throw new RuntimeException("Erreur lors de la récupération de la consultation", e);
        }
    }

    /**
     * Créer une ordonnance médicaments
     */
    @Transactional
    public OrdonnanceDTO createOrdonnanceMedicaments(OrdonnanceRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("📝 Création ordonnance MEDICAMENTS pour médecin {}", medecinId);

            // Récupérer la consultation EN_COURS
            ConsultationDTO consultationDTO = getConsultationEnCours(medecinId);
            if (consultationDTO == null) {
                throw new RuntimeException("Aucune consultation en cours. Veuillez créer une consultation d'abord.");
            }

            Consultation consultation = consultationMedRepository.findByIdAndMedecin(
                            consultationDTO.getIdConsultation(), medecinId)
                    .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));

            Ordonnance ordonnance = new Ordonnance();
            ordonnance.setType(Ordonnance.Type.MEDICAMENTS);
            ordonnance.setDate(LocalDateTime.now());
            ordonnance.setContenu(requestDTO.getContenu());
            ordonnance.setConsultation(consultation);

            Ordonnance savedOrdonnance = ordonnanceRepository.save(ordonnance);
            log.info("✅ Ordonnance MEDICAMENTS créée (ID: {})", savedOrdonnance.getId());

            return toDTO(savedOrdonnance);

        } catch (Exception e) {
            log.error("❌ Erreur création ordonnance MEDICAMENTS: ", e);
            throw new RuntimeException("Erreur lors de la création de l'ordonnance: " + e.getMessage(), e);
        }
    }

    /**
     * Créer une ordonnance examens
     */
    @Transactional
    public OrdonnanceDTO createOrdonnanceExamens(OrdonnanceRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("📝 Création ordonnance EXAMENS pour médecin {}", medecinId);

            // Récupérer la consultation EN_COURS
            ConsultationDTO consultationDTO = getConsultationEnCours(medecinId);
            if (consultationDTO == null) {
                throw new RuntimeException("Aucune consultation en cours. Veuillez créer une consultation d'abord.");
            }

            Consultation consultation = consultationMedRepository.findByIdAndMedecin(
                            consultationDTO.getIdConsultation(), medecinId)
                    .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));

            // Créer l'ordonnance principale
            Ordonnance ordonnance = new Ordonnance();
            ordonnance.setType(Ordonnance.Type.EXAMENS);
            ordonnance.setDate(LocalDateTime.now());
            ordonnance.setContenu(requestDTO.getContenu());
            ordonnance.setConsultation(consultation);

            Ordonnance savedOrdonnance = ordonnanceRepository.save(ordonnance);

            // Créer les examens détaillés
            if (requestDTO.getExamens() != null && !requestDTO.getExamens().isEmpty()) {
                for (OrdonnanceExamenDTO examenDTO : requestDTO.getExamens()) {
                    OrdonnanceExamen examen = new OrdonnanceExamen();
                    examen.setOrdonnance(savedOrdonnance);
                    examen.setTypeExamen(examenDTO.getTypeExamen());
                    examen.setIndications(examenDTO.getIndications());
                    examen.setUrgent(examenDTO.getUrgent() != null ? examenDTO.getUrgent() : false);
                    ordonnanceExamenRepository.save(examen);
                }
            }

            log.info("✅ Ordonnance EXAMENS créée (ID: {})", savedOrdonnance.getId());

            return toDTO(savedOrdonnance);

        } catch (Exception e) {
            log.error("❌ Erreur création ordonnance EXAMENS: ", e);
            throw new RuntimeException("Erreur lors de la création de l'ordonnance: " + e.getMessage(), e);
        }
    }

    /**
     * Mettre à jour une ordonnance
     */
    @Transactional
    public OrdonnanceDTO updateOrdonnance(Integer ordonnanceId, OrdonnanceRequestDTO requestDTO, Integer medecinId) {
        try {
            log.info("📝 Mise à jour ordonnance {} par médecin {}", ordonnanceId, medecinId);

            Ordonnance ordonnance = ordonnanceRepository.findByIdAndMedecin(ordonnanceId, medecinId)
                    .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée ou accès non autorisé"));

            ordonnance.setContenu(requestDTO.getContenu());

            // Si c'est une ordonnance d'examens, mettre à jour les examens
            if (ordonnance.getType() == Ordonnance.Type.EXAMENS && requestDTO.getExamens() != null) {
                // Supprimer les anciens examens
                ordonnanceExamenRepository.deleteByOrdonnanceId(ordonnanceId);

                // Créer les nouveaux examens
                for (OrdonnanceExamenDTO examenDTO : requestDTO.getExamens()) {
                    OrdonnanceExamen examen = new OrdonnanceExamen();
                    examen.setOrdonnance(ordonnance);
                    examen.setTypeExamen(examenDTO.getTypeExamen());
                    examen.setIndications(examenDTO.getIndications());
                    examen.setUrgent(examenDTO.getUrgent() != null ? examenDTO.getUrgent() : false);
                    ordonnanceExamenRepository.save(examen);
                }
            }

            Ordonnance updatedOrdonnance = ordonnanceRepository.save(ordonnance);
            log.info("✅ Ordonnance mise à jour");

            return toDTO(updatedOrdonnance);

        } catch (Exception e) {
            log.error("❌ Erreur mise à jour ordonnance: ", e);
            throw new RuntimeException("Erreur lors de la mise à jour: " + e.getMessage(), e);
        }
    }

    /**
     * Supprimer une ordonnance
     */
    @Transactional
    public void deleteOrdonnance(Integer ordonnanceId, Integer medecinId) {
        try {
            log.info("🗑️ Suppression ordonnance {} par médecin {}", ordonnanceId, medecinId);

            Ordonnance ordonnance = ordonnanceRepository.findByIdAndMedecin(ordonnanceId, medecinId)
                    .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée ou accès non autorisé"));

            ordonnanceRepository.delete(ordonnance);
            log.info("✅ Ordonnance supprimée");

        } catch (Exception e) {
            log.error("❌ Erreur suppression ordonnance: ", e);
            throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage(), e);
        }
    }

    /**
     * Convertir Ordonnance en DTO
     */
    private OrdonnanceDTO toDTO(Ordonnance ordonnance) {
        OrdonnanceDTO dto = new OrdonnanceDTO();
        dto.setId(ordonnance.getId());
        dto.setType(ordonnance.getType());
        dto.setDate(ordonnance.getDate());
        dto.setContenu(ordonnance.getContenu());

        if (ordonnance.getConsultation() != null) {
            dto.setIdConsultation(ordonnance.getConsultation().getIdConsultation());

            Patient patient = ordonnance.getConsultation().getPatient();
            if (patient != null) {
                dto.setIdPatient(patient.getId());
                dto.setPatientNom(patient.getNom());
                dto.setPatientPrenom(patient.getPrenom());
                dto.setPatientCin(patient.getCin());
                dto.setPatientDateNaissance(patient.getDateNaissance()); // ✅ AJOUTER
                dto.setPatientTel(patient.getNumTel());                   // ✅ AJOUTER
            }

            Utilisateur medecin = ordonnance.getConsultation().getMedecin();
            if (medecin != null) {
                dto.setIdMedecin(medecin.getId());
                dto.setMedecinNom(medecin.getNom());
                dto.setMedecinPrenom(medecin.getPrenom());
            }
        }

        // Charger les examens si c'est une ordonnance d'examens
        if (ordonnance.getType() == Ordonnance.Type.EXAMENS) {
            List<OrdonnanceExamen> examens = ordonnanceExamenRepository.findByOrdonnanceId(ordonnance.getId());
            dto.setExamens(examens.stream()
                    .map(this::toExamenDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private OrdonnanceExamenDTO toExamenDTO(OrdonnanceExamen examen) {
        OrdonnanceExamenDTO dto = new OrdonnanceExamenDTO();
        dto.setId(examen.getId());
        dto.setTypeExamen(examen.getTypeExamen());
        dto.setIndications(examen.getIndications());
        dto.setUrgent(examen.getUrgent());
        return dto;
    }

    private ConsultationDTO toConsultationDTO(Consultation consultation) {
        ConsultationDTO dto = new ConsultationDTO();
        dto.setIdConsultation(consultation.getIdConsultation());
        dto.setType(consultation.getType());
        dto.setDateConsultation(consultation.getDateConsultation());

        if (consultation.getPatient() != null) {
            dto.setIdPatient(consultation.getPatient().getId());
            dto.setPatientNom(consultation.getPatient().getNom());
            dto.setPatientPrenom(consultation.getPatient().getPrenom());
            dto.setPatientCin(consultation.getPatient().getCin());
        }

        return dto;
    }
}