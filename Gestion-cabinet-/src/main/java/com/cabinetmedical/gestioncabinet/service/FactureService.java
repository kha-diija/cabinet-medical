package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.FactureDTO;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.*;
import com.lowagie.text.DocumentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FactureService {

    private final FactureRepository factureRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final FacturePdfService facturePdfService;

    /**
     * Récupère toutes les factures (mode développement)
     */
    public List<FactureDTO> getAllFactures() {
        log.info("📋 Récupération de toutes les factures");
        List<Facture> factures = factureRepository.findAll();
        log.info("✅ {} factures trouvées", factures.size());
        return factures.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les factures du cabinet de l'utilisateur
     */
    public List<FactureDTO> getFacturesByCabinet(String username) {
        log.info("📋 Récupération des factures pour l'utilisateur: {}", username);

        Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Cabinet cabinet = utilisateur.getCabinet();
        if (cabinet == null) {
            throw new RuntimeException("Cabinet non trouvé pour l'utilisateur");
        }

        List<Facture> factures = factureRepository.findByCabinet(cabinet);
        log.info("✅ {} factures trouvées pour le cabinet {}", factures.size(), cabinet.getNom());

        return factures.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère une facture par son ID
     */
    public FactureDTO getFactureById(Integer id) {
        log.info("📄 Récupération de la facture {}", id);
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        return convertToDTO(facture);
    }

    /**
     * Récupère une facture par son ID avec vérification du cabinet
     */
    public FactureDTO getFactureById(Integer id, String username) {
        log.info("📄 Récupération de la facture {} pour {}", id, username);

        Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        // Vérifier que la facture appartient au même cabinet
        if (!facture.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
            throw new RuntimeException("Accès non autorisé à cette facture");
        }

        return convertToDTO(facture);
    }

    /**
     * Récupère les factures d'un patient
     */
    public List<FactureDTO> getFacturesByPatient(Integer patientId, String username) {
        log.info("📋 Récupération des factures du patient {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        // Si username fourni, vérifier le cabinet
        if (username != null) {
            Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!patient.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
                throw new RuntimeException("Accès non autorisé aux factures de ce patient");
            }
        }

        List<Facture> factures = factureRepository.findByPatient(patient);
        log.info("✅ {} factures trouvées pour le patient", factures.size());

        return factures.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crée une nouvelle facture à partir d'une consultation
     */
    public FactureDTO creerFactureDepuisConsultation(Integer consultationId, String username) {
        log.info("💰 Création d'une facture pour la consultation {}", consultationId);

        Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));

        // Vérifier si une facture existe déjà pour cette consultation
        if (consultation.getFacture() != null) {
            throw new RuntimeException("Une facture existe déjà pour cette consultation");
        }

        Facture facture = new Facture();
        facture.setConsultation(consultation);
        facture.setPatient(consultation.getPatient());
        facture.setCabinet(utilisateur.getCabinet());
        facture.setMontant(consultation.getMontant());
        facture.setModePaiement(Facture.ModePaiement.ESPECES); // Par défaut
        facture.setStatut(Facture.Statut.EN_ATTENTE);
        facture.setDateEmission(LocalDate.now());

        Facture savedFacture = factureRepository.save(facture);
        log.info("✅ Facture {} créée avec succès", savedFacture.getIdFacture());

        return convertToDTO(savedFacture);
    }

    /**
     * Valide le paiement d'une facture
     */
    public FactureDTO validerPaiement(Integer factureId, Facture.ModePaiement modePaiement, String username) {
        log.info("💳 Validation du paiement de la facture {} avec mode: {}", factureId, modePaiement);

        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        // Vérifier le cabinet si username fourni
        if (username != null) {
            Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!facture.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
                throw new RuntimeException("Accès non autorisé à cette facture");
            }
        }

        // Vérifier que la facture n'est pas déjà payée ou annulée
        if (facture.getStatut() == Facture.Statut.PAYEE) {
            throw new RuntimeException("Cette facture est déjà payée");
        }

        if (facture.getStatut() == Facture.Statut.ANNULEE) {
            throw new RuntimeException("Impossible de valider une facture annulée");
        }

        facture.setStatut(Facture.Statut.PAYEE);
        facture.setModePaiement(modePaiement);
        facture.setDatePaiement(LocalDate.now());

        Facture savedFacture = factureRepository.save(facture);
        log.info("✅ Paiement validé pour la facture {}", factureId);

        return convertToDTO(savedFacture);
    }

    /**
     * Annule une facture
     */
    public FactureDTO annulerFacture(Integer factureId, String username) {
        log.info("❌ Annulation de la facture {}", factureId);

        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        // Vérifier le cabinet si username fourni
        if (username != null) {
            Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!facture.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
                throw new RuntimeException("Accès non autorisé à cette facture");
            }
        }

        // Vérifier que la facture n'est pas déjà payée
        if (facture.getStatut() == Facture.Statut.PAYEE) {
            throw new RuntimeException("Impossible d'annuler une facture déjà payée");
        }

        facture.setStatut(Facture.Statut.ANNULEE);

        Facture savedFacture = factureRepository.save(facture);
        log.info("✅ Facture {} annulée", factureId);

        return convertToDTO(savedFacture);
    }
    @Transactional
    public FactureDTO modifierFacture(Integer id, FactureDTO factureDTO, String username) {
        log.info("✏️ Modification de la facture {}", id);

        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        // Vérifier l'appartenance au cabinet si username fourni
        if (username != null) {
            verifierAppartenanceCabinet(facture, username);
        }

        // Vérifier que la facture peut être modifiée
        if (facture.getStatut() == Facture.Statut.ANNULEE) {
            throw new IllegalStateException("Impossible de modifier une facture annulée");
        }

        // Mise à jour des champs modifiables
        if (factureDTO.getMontant() != null) {
            facture.setMontant(factureDTO.getMontant());
        }

        if (factureDTO.getModePaiement() != null) {
            facture.setModePaiement(Facture.ModePaiement.valueOf(factureDTO.getModePaiement()));
        }

        if (factureDTO.getDateEmission() != null) {
            facture.setDateEmission(factureDTO.getDateEmission());
        }

        // Ne permettre la modification du statut que si c'est cohérent
        if (factureDTO.getStatut() != null && !factureDTO.getStatut().equals(facture.getStatut().name())) {
            Facture.Statut nouveauStatut = Facture.Statut.valueOf(factureDTO.getStatut());

            // Si on passe à PAYEE, définir la date de paiement
            if (nouveauStatut == Facture.Statut.PAYEE && facture.getDatePaiement() == null) {
                facture.setDatePaiement(LocalDate.now());
            }

            facture.setStatut(nouveauStatut);
        }

        Facture factureSauvegardee = factureRepository.save(facture);
        log.info("✅ Facture {} modifiée", id);

        return convertToDTO(factureSauvegardee);
    }

    private void verifierAppartenanceCabinet(Facture facture, String username) {
        log.debug("🔒 Vérification appartenance cabinet pour l'utilisateur: {}", username);

        // Utilisez findByLogin au lieu de findByUsername
        Utilisateur utilisateur = utilisateurRepository.findByLogin(username)  // ← CHANGÉ ICI
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (utilisateur.getCabinet() == null) {
            throw new RuntimeException("Utilisateur sans cabinet associé");
        }

        if (!facture.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
            throw new RuntimeException("Accès non autorisé à cette facture");
        }

        log.debug("✅ Vérification réussie - Facture appartient au cabinet");
    }
    /**
     * Génère le PDF d'une facture
     */
    public byte[] genererPdfFacture(Integer factureId, String username) throws DocumentException, IOException {
        log.info("🖨️ Génération du PDF pour la facture {}", factureId);

        Facture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        // Vérifier le cabinet si username fourni
        if (username != null) {
            Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!facture.getCabinet().getIdCabinet().equals(utilisateur.getCabinet().getIdCabinet())) {
                throw new RuntimeException("Accès non autorisé à cette facture");
            }
        }

        byte[] pdfBytes = facturePdfService.genererPdfFacture(facture);
        log.info("✅ PDF généré avec succès ({} bytes)", pdfBytes.length);

        return pdfBytes;
    }

    /**
     * Récupère les statistiques des factures
     */
    public FactureStatsDTO getStatistiques(String username) {
        log.info("📊 Récupération des statistiques de factures");

        Utilisateur utilisateur = utilisateurRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Facture> factures = factureRepository.findByCabinet(utilisateur.getCabinet());

        long totalFactures = factures.size();
        long facturesPayees = factures.stream()
                .filter(f -> f.getStatut() == Facture.Statut.PAYEE)
                .count();
        long facturesEnAttente = factures.stream()
                .filter(f -> f.getStatut() == Facture.Statut.EN_ATTENTE)
                .count();
        long facturesAnnulees = factures.stream()
                .filter(f -> f.getStatut() == Facture.Statut.ANNULEE)
                .count();

        double montantTotal = factures.stream()
                .filter(f -> f.getStatut() == Facture.Statut.PAYEE)
                .mapToDouble(f -> f.getMontant().doubleValue())
                .sum();

        double montantEnAttente = factures.stream()
                .filter(f -> f.getStatut() == Facture.Statut.EN_ATTENTE)
                .mapToDouble(f -> f.getMontant().doubleValue())
                .sum();

        return FactureStatsDTO.builder()
                .totalFactures(totalFactures)
                .facturesPayees(facturesPayees)
                .facturesEnAttente(facturesEnAttente)
                .facturesAnnulees(facturesAnnulees)
                .montantTotal(montantTotal)
                .montantEnAttente(montantEnAttente)
                .build();
    }

    /**
     * Convertit une entité Facture en DTO
     */
    private FactureDTO convertToDTO(Facture facture) {
        FactureDTO dto = new FactureDTO();
        dto.setIdFacture(facture.getIdFacture());
        dto.setMontant(BigDecimal.valueOf(facture.getMontant().doubleValue()));
        dto.setModePaiement(facture.getModePaiement().name());
        dto.setStatut(facture.getStatut().name());
        dto.setDateEmission(facture.getDateEmission());
        dto.setDatePaiement(facture.getDatePaiement());

        // Informations patient
        if (facture.getPatient() != null) {
            dto.setIdPatient(facture.getPatient().getIdPatient());
            dto.setNomPatient(facture.getPatient().getNom());
            dto.setPrenomPatient(facture.getPatient().getPrenom());
        }

        // Informations consultation
        if (facture.getConsultation() != null) {
            dto.setIdConsultation(facture.getConsultation().getIdConsultation());
            dto.setMotifConsultation(facture.getConsultation().getMotif());
        }

        // Informations cabinet
        if (facture.getCabinet() != null) {
            dto.setIdCabinet(facture.getCabinet().getIdCabinet());
            dto.setNomCabinet(facture.getCabinet().getNom());
        }

        return dto;
    }

    /**
     * DTO pour les statistiques de factures
     */
    @lombok.Data
    @lombok.Builder
    public static class FactureStatsDTO {
        private long totalFactures;
        private long facturesPayees;
        private long facturesEnAttente;
        private long facturesAnnulees;
        private double montantTotal;
        private double montantEnAttente;
    }
}