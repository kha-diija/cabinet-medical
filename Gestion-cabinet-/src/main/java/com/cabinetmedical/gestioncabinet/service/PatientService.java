
package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.PatientDTO;
import com.cabinetmedical.gestioncabinet.dto.PatientSearchDTO;
import com.cabinetmedical.gestioncabinet.exception.ResourceNotFoundException;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.*;
import com.cabinetmedical.gestioncabinet.repository.admin.CabinetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final CabinetRepository cabinetRepository;
    private final PatientEnCoursRepository patientEnCoursRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    /**
     * ✅ Récupère l'utilisateur connecté et son cabinet
     * Retourne null en mode dev sans authentification
     */
    private Utilisateur getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return utilisateurRepository.findByLogin(auth.getName())
                        .orElse(null);
            }
        } catch (Exception e) {
            // En mode dev sans authentification
        }
        return null;
    }

    /**
     * ✅ Récupère le cabinet de l'utilisateur connecté
     * En mode dev : retourne le premier cabinet disponible
     */
    private Cabinet getCurrentCabinet() {
        Utilisateur currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getCabinet() != null) {
            return currentUser.getCabinet();
        }

        // MODE DEV : Récupérer le premier cabinet disponible
        return cabinetRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Aucun cabinet trouvé"));
    }

    /**
     * ✅ CRÉER UN PATIENT - Automatiquement associé au cabinet
     */
    public PatientDTO createPatient(PatientDTO dto) {
        // Vérifier si le CIN existe déjà (vérification globale ou par cabinet selon besoin)
        if (patientRepository.existsByCin(dto.getCin())) {
            throw new IllegalArgumentException("Un patient avec ce CIN existe déjà");
        }

        Patient patient = mapToEntity(dto);

        // ✅ ASSOCIER AU CABINET DE L'UTILISATEUR CONNECTÉ
        Cabinet cabinet = getCurrentCabinet();
        patient.setCabinet(cabinet);

        Patient saved = patientRepository.save(patient);

        // Créer automatiquement le dossier médical
        if (saved.getDossierMedical() == null) {
            DossierMedical dossier = new DossierMedical();
            dossier.setPatient(saved);
            dossier.setDateCreation(LocalDate.now());
            saved.setDossierMedical(dossier);
        }

        return mapToDTO(saved);
    }

    /**
     * ✅ METTRE À JOUR UN PATIENT - Vérifier qu'il appartient au cabinet
     */
    public PatientDTO updatePatient(Integer id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID: " + id));

        // ✅ SÉCURITÉ : Vérifier que le patient appartient au cabinet de l'utilisateur
        Utilisateur currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getCabinet() != null) {
            if (!patient.getCabinet().getId().equals(currentUser.getCabinet().getId())) {
                throw new IllegalArgumentException("Vous n'avez pas accès à ce patient");
            }
        }

        // Vérifier si le CIN a changé et n'existe pas déjà
        if (!patient.getCin().equals(dto.getCin()) && patientRepository.existsByCin(dto.getCin())) {
            throw new IllegalArgumentException("Un patient avec ce CIN existe déjà");
        }

        updateEntityFromDTO(patient, dto);
        Patient updated = patientRepository.save(patient);

        return mapToDTO(updated);
    }

    /**
     * ✅ RÉCUPÉRER UN PATIENT PAR ID - Vérifier l'accès
     */
    public PatientDTO getPatientById(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID: " + id));

        // ✅ SÉCURITÉ : Vérifier l'accès
        Utilisateur currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getCabinet() != null) {
            if (!patient.getCabinet().getId().equals(currentUser.getCabinet().getId())) {
                throw new IllegalArgumentException("Vous n'avez pas accès à ce patient");
            }
        }

        return mapToDTO(patient);
    }

    /**
     * ✅ RÉCUPÉRER TOUS LES PATIENTS - FILTRÉS PAR CABINET
     */
    public Page<PatientDTO> getAllPatients(Pageable pageable) {
        Utilisateur currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getCabinet() != null) {
            // ✅ MODE PRODUCTION : Filtrer par cabinet
            return patientRepository.findByCabinet(currentUser.getCabinet(), pageable)
                    .map(this::mapToDTO);
        } else {
            // MODE DEV : Retourner le premier cabinet disponible
            Cabinet defaultCabinet = cabinetRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Aucun cabinet trouvé"));

            return patientRepository.findByCabinet(defaultCabinet, pageable)
                    .map(this::mapToDTO);
        }
    }

    /**
     * ✅ RECHERCHER PAR CIN - Dans le cabinet
     */
    public PatientDTO findByCin(String cin) {
        Utilisateur currentUser = getCurrentUser();
        Patient patient;

        if (currentUser != null && currentUser.getCabinet() != null) {
            // Mode authentifié : chercher dans le cabinet
            patient = patientRepository.findByCinAndCabinet(cin, currentUser.getCabinet())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec le CIN: " + cin));
        } else {
            // Mode dev : recherche globale
            patient = patientRepository.findByCin(cin)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec le CIN: " + cin));
        }

        return mapToDTO(patient);
    }

    /**
     * ✅ RECHERCHER PAR NOM/PRÉNOM - Dans le cabinet
     */
    public List<PatientDTO> searchByNomPrenom(String nom, String prenom) {
        Utilisateur currentUser = getCurrentUser();
        List<Patient> patients;

        if (currentUser != null && currentUser.getCabinet() != null) {
            // ✅ MODE PRODUCTION : Recherche dans le cabinet
            if (prenom != null && !prenom.isEmpty()) {
                patients = patientRepository.findByNomContainingIgnoreCaseAndPrenomContainingIgnoreCaseAndCabinet(
                        nom, prenom, currentUser.getCabinet());
            } else {
                patients = patientRepository.findByNomContainingIgnoreCaseAndCabinet(
                        nom, currentUser.getCabinet());
            }
        } else {
            // MODE DEV : Recherche dans le premier cabinet
            Cabinet defaultCabinet = cabinetRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Aucun cabinet trouvé"));

            if (prenom != null && !prenom.isEmpty()) {
                patients = patientRepository.findByNomContainingIgnoreCaseAndPrenomContainingIgnoreCaseAndCabinet(
                        nom, prenom, defaultCabinet);
            } else {
                patients = patientRepository.findByNomContainingIgnoreCaseAndCabinet(nom, defaultCabinet);
            }
        }

        return patients.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Recherche avancée - À implémenter selon vos besoins
     */
    public List<PatientDTO> advancedSearch(PatientSearchDTO searchDTO) {
        // TODO: Implémenter la recherche avancée avec Specification
        // N'oubliez pas de filtrer par cabinet !
        return List.of();
    }

    /**
     * ✅ CORRECTION : Envoyer un patient au médecin avec notification
     */
    public void envoyerPatientAuMedecin(Integer patientId, Integer medecinId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        Utilisateur medecin = utilisateurRepository.findById(medecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        if (medecin.getRole() != Utilisateur.Role.MEDECIN) {
            throw new IllegalArgumentException("L'utilisateur n'est pas un médecin");
        }

        Utilisateur secretaire = getCurrentUser();
        if (secretaire == null) {
            throw new ResourceNotFoundException("Utilisateur non connecté");
        }

        // ✅ SÉCURITÉ : Vérifier que le patient et le médecin sont du même cabinet
        if (patient.getCabinet() != null && medecin.getCabinet() != null) {
            if (!patient.getCabinet().getId().equals(medecin.getCabinet().getId())) {
                throw new IllegalArgumentException("Le patient et le médecin ne sont pas du même cabinet");
            }
        }

        // Désactiver les anciens "patient en cours" pour ce médecin
        patientEnCoursRepository.findByMedecinAndActif(medecin, true)
                .forEach(p -> p.setActif(false));

        // Créer un nouveau "patient en cours"
        PatientEnCours patientEnCours = new PatientEnCours();
        patientEnCours.setPatient(patient);
        patientEnCours.setMedecin(medecin);
        patientEnCours.setSecretaire(secretaire);
        patientEnCours.setDateEnvoi(LocalDateTime.now());
        patientEnCours.setActif(true);

        patientEnCoursRepository.save(patientEnCours);

        // ✅ CORRECTION : Utiliser la bonne méthode du NotificationService
        notificationService.creerNotificationAutomatique(
                medecin,
                Notification.Type.PATIENT_EN_COURS,
                "Patient " + patient.getNom() + " " + patient.getPrenom() + " envoyé par " +
                        secretaire.getNom() + " " + secretaire.getPrenom(),
                null
        );
    }

    /**
     * ✅ SUPPRIMER UN PATIENT - Vérifier l'accès
     */
    public void deletePatient(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'ID: " + id));

        // ✅ SÉCURITÉ : Vérifier l'accès
        Utilisateur currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getCabinet() != null) {
            if (!patient.getCabinet().getId().equals(currentUser.getCabinet().getId())) {
                throw new IllegalArgumentException("Vous n'avez pas accès à ce patient");
            }
        }

        // Vérifier si le patient a des consultations ou rendez-vous
        if (!patient.getConsultations().isEmpty() || !patient.getRendezVous().isEmpty()) {
            throw new IllegalStateException("Impossible de supprimer un patient avec des consultations ou rendez-vous");
        }

        patientRepository.delete(patient);
    }

    // ========== MÉTHODES DE MAPPING ==========

    private Patient mapToEntity(PatientDTO dto) {
        Patient patient = new Patient();
        updateEntityFromDTO(patient, dto);
        return patient;
    }

    private void updateEntityFromDTO(Patient patient, PatientDTO dto) {
        patient.setCin(dto.getCin());
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setSexe(Patient.Sexe.valueOf(dto.getSexe()));
        patient.setNumTel(dto.getNumTel());
        patient.setTypeMutuelle(dto.getTypeMutuelle());
        patient.setAdresse(dto.getAdresse());
        patient.setEmail(dto.getEmail());
    }

    private PatientDTO mapToDTO(Patient patient) {
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
        dto.setIdCabinet(patient.getCabinet() != null ? patient.getCabinet().getId() : null);
        dto.setDateCreation(patient.getDateCreation());

        // Calculer l'âge
        if (patient.getDateNaissance() != null) {
            dto.setAge(Period.between(patient.getDateNaissance(), LocalDate.now()).getYears());
        }

        // Informations supplémentaires
        dto.setHasDossierMedical(patient.getDossierMedical() != null);
        dto.setNombreConsultations(patient.getConsultations() != null ? patient.getConsultations().size() : 0);

        return dto;
    }
}