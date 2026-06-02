package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.InscriptionCabinetDTO;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionService {

    private final DemandeCreationCabinetRepository demandeRepository;
    private final AlerteAdminRepository alerteRepository;
    private final PasswordEncoder passwordEncoder;
    private final CabinetsRepository cabinetRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public DemandeCreationCabinet creerDemande(InscriptionCabinetDTO dto) {
        log.info("🔍 Début création demande pour: {}", dto.getNomCabinet());

        // Validation
        if (demandeRepository.existsByLoginMedecin(dto.getLoginMedecin())) {
            throw new RuntimeException("Ce login est déjà utilisé");
        }
        if (dto.getEmailMedecin() != null && !dto.getEmailMedecin().isEmpty()
                && demandeRepository.existsByEmailMedecin(dto.getEmailMedecin())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // Créer la demande
        DemandeCreationCabinet demande = new DemandeCreationCabinet();

        // Informations Cabinet
        demande.setNomCabinet(dto.getNomCabinet());
        demande.setSpecialite(dto.getSpecialite());
        demande.setAdresseCabinet(dto.getAdresseCabinet());
        demande.setTelCabinet(dto.getTelCabinet());
        demande.setEmailCabinet(dto.getEmailCabinet());
        demande.setLogoCabinet(dto.getLogoCabinet()); // 🔥 URL Supabase

        // Informations Médecin
        demande.setNomMedecin(dto.getNomMedecin());
        demande.setPrenomMedecin(dto.getPrenomMedecin());
        demande.setCinMedecin(dto.getCinMedecin());
        demande.setTelMedecin(dto.getTelMedecin());
        demande.setEmailMedecin(dto.getEmailMedecin());
        demande.setLoginMedecin(dto.getLoginMedecin());
        demande.setPwdMedecin(passwordEncoder.encode(dto.getPwdMedecin()));
        demande.setSignatureMedecin(dto.getSignatureMedecin()); // 🔥 URL Supabase

        // Informations Secrétaire (si incluse)
        if (dto.getIncludeSecretaire() != null && dto.getIncludeSecretaire()) {
            demande.setNomSecretaire(dto.getNomSecretaire());
            demande.setPrenomSecretaire(dto.getPrenomSecretaire());
            demande.setCinSecretaire(dto.getCinSecretaire());
            demande.setTelSecretaire(dto.getTelSecretaire());
            demande.setEmailSecretaire(dto.getEmailSecretaire());
            demande.setLoginSecretaire(dto.getLoginSecretaire());
            demande.setPwdSecretaire(passwordEncoder.encode(dto.getPwdSecretaire()));
        }

        // Documents (URLs Supabase)
        demande.setDocumentDiplome(dto.getDocumentDiplome());
        demande.setDocumentCinMedecin(dto.getDocumentCinMedecin());
        demande.setDocumentLicence(dto.getDocumentLicence());

        demande.setStatut(DemandeCreationCabinet.Statut.EN_ATTENTE);
        demande.setDateDemande(LocalDateTime.now());

        // 🔥 Sauvegarder la demande
        DemandeCreationCabinet savedDemande = demandeRepository.save(demande);
        log.info("✅ Demande sauvegardée avec ID: {}", savedDemande.getId());

        // 🔥 Créer l'alerte admin
        try {
            creerAlerteAdmin(savedDemande);
            log.info("✅ Alerte admin créée avec succès");
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création de l'alerte admin", e);
            // On ne lance pas d'exception pour ne pas bloquer la création de la demande
        }

        return savedDemande;
    }

    private void creerAlerteAdmin(DemandeCreationCabinet demande) {
        AlerteAdmin alerte = new AlerteAdmin();
        alerte.setType(AlerteAdmin.TypeAlerte.NOUVELLE_DEMANDE_CABINET);
        alerte.setTitre("Nouvelle demande d'inscription");
        alerte.setMessage(String.format(
                "Nouvelle demande de création de cabinet médical.\n" +
                        "Cabinet: %s\n" +
                        "Médecin: Dr. %s %s\n" +
                        "Email: %s\n" +
                        "Téléphone: %s",
                demande.getNomCabinet(),
                demande.getNomMedecin(),
                demande.getPrenomMedecin(),
                demande.getEmailMedecin(),
                demande.getTelMedecin()
        ));
        alerte.setDemandeCabinet(demande);
        alerte.setNomDemandeur(demande.getNomMedecin() + " " + demande.getPrenomMedecin());
        alerte.setEmailDemandeur(demande.getEmailMedecin());
        alerte.setLu(false);
        alerte.setDateCreation(LocalDateTime.now());

        alerteRepository.save(alerte);
        log.info("📧 Alerte créée pour la demande ID: {}", demande.getId());
    }

    @Transactional
    public void approuverDemande(Integer demandeId, Integer adminId) {
        DemandeCreationCabinet demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        // Créer le cabinet
        Cabinet cabinet = new Cabinet();
        cabinet.setNom(demande.getNomCabinet());
        cabinet.setSpecialite(demande.getSpecialite());
        cabinet.setAdresse(demande.getAdresseCabinet());
        cabinet.setTel(demande.getTelCabinet());
        cabinet.setLogo(demande.getLogoCabinet());
        cabinet.setActif(true);
        Cabinet savedCabinet = cabinetRepository.save(cabinet);

        // Créer le médecin
        Utilisateur medecin = new Utilisateur();
        medecin.setLogin(demande.getLoginMedecin());
        medecin.setPwd(demande.getPwdMedecin()); // Déjà encodé
        medecin.setNom(demande.getNomMedecin());
        medecin.setPrenom(demande.getPrenomMedecin());
        medecin.setNumTel(demande.getTelMedecin());
        medecin.setSignature(demande.getSignatureMedecin());
        medecin.setRole(Utilisateur.Role.MEDECIN);
        medecin.setCabinet(savedCabinet);
        medecin.setActif(true);
        utilisateurRepository.save(medecin);

        // Créer la secrétaire si présente
        if (demande.getNomSecretaire() != null && !demande.getNomSecretaire().isEmpty()) {
            Utilisateur secretaire = new Utilisateur();
            secretaire.setLogin(demande.getLoginSecretaire());
            secretaire.setPwd(demande.getPwdSecretaire()); // Déjà encodé
            secretaire.setNom(demande.getNomSecretaire());
            secretaire.setPrenom(demande.getPrenomSecretaire());
            secretaire.setNumTel(demande.getTelSecretaire());
            secretaire.setRole(Utilisateur.Role.SECRETAIRE);
            secretaire.setCabinet(savedCabinet);
            secretaire.setActif(true);
            utilisateurRepository.save(secretaire);
        }

        // Mettre à jour la demande
        demande.setStatut(DemandeCreationCabinet.Statut.APPROUVEE);
        demande.setDateTraitement(LocalDateTime.now());
        Utilisateur admin = utilisateurRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin non trouvé"));
        demande.setAdminTraitant(admin);
        demandeRepository.save(demande);
    }

    @Transactional
    public void rejeterDemande(Integer demandeId, Integer adminId, String commentaire) {
        DemandeCreationCabinet demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        demande.setStatut(DemandeCreationCabinet.Statut.REJETEE);
        demande.setDateTraitement(LocalDateTime.now());
        demande.setCommentaireAdmin(commentaire);
        Utilisateur admin = utilisateurRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin non trouvé"));
        demande.setAdminTraitant(admin);
        demandeRepository.save(demande);
    }
}