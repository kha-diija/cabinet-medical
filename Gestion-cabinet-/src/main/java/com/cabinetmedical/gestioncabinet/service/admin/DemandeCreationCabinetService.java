/*package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.DemandeDTO;
import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.admin.DemandeCreationCabinetRepositoryAdmin;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeCreationCabinetService {

    private final DemandeCreationCabinetRepositoryAdmin demandeRepository;
    private final UtilisateurServiceAdmin utilisateurServiceAdmin;
    private final EmailService emailService;
    private final CabinetService cabinetService;

    public DemandeCreationCabinetService(DemandeCreationCabinetRepositoryAdmin demandeRepository,
                                         UtilisateurServiceAdmin utilisateurServiceAdmin,
                                         EmailService emailService,
                                         CabinetService cabinetService) {
        this.demandeRepository = demandeRepository;
        this.utilisateurServiceAdmin = utilisateurServiceAdmin;
        this.emailService = emailService;
        this.cabinetService = cabinetService;
    }

    // Récupérer toutes les demandes
    public List<DemandeDTO> getAllDemandes() {
        return demandeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Récupérer les demandes par statut
    public List<DemandeDTO> getDemandesByStatut(DemandeCreationCabinet.Statut statut) {
        return demandeRepository.findByStatut(statut).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Approuver une demande
    public void approuverDemande(Integer id, Utilisateur admin) {
        DemandeCreationCabinet demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
            throw new RuntimeException("Demande déjà traitée");
        }

        // Créer le cabinet et les utilisateurs
        cabinetService.creerCabinetEtUtilisateurs(demande);

        // Mettre à jour la demande
        demande.setStatut(DemandeCreationCabinet.Statut.APPROUVEE);
        demande.setAdminTraitant(admin);
        demande.setDateTraitement(LocalDateTime.now());
        demandeRepository.save(demande);
    }

    // Rejeter une demande
    public void rejeterDemande(Integer id, String commentaire, Utilisateur admin) {
        DemandeCreationCabinet demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
            throw new RuntimeException("Demande déjà traitée");
        }

        demande.setStatut(DemandeCreationCabinet.Statut.REJETEE);
        demande.setCommentaireAdmin(commentaire);
        demande.setAdminTraitant(admin);
        demande.setDateTraitement(LocalDateTime.now());
        demandeRepository.save(demande);

        // Envoyer email de refus
        emailService.sendDemandeRefuseNotification(demande.getEmailMedecin(), commentaire);
    }

    // Convertir entity en DTO
    private DemandeDTO toDTO(DemandeCreationCabinet demande) {
        return new DemandeDTO(
                demande.getId(),
                demande.getNomCabinet(),
                demande.getSpecialite(),
                demande.getAdresseCabinet(),
                demande.getTelCabinet(),
                demande.getEmailCabinet(),
                demande.getLogoCabinet(),
                demande.getNomMedecin(),
                demande.getPrenomMedecin(),
                demande.getCinMedecin(),
                demande.getTelMedecin(),
                demande.getEmailMedecin(),
                demande.getLoginMedecin(),
                demande.getSignatureMedecin(),
                demande.getNomSecretaire(),
                demande.getPrenomSecretaire(),
                demande.getCinSecretaire(),
                demande.getTelSecretaire(),
                demande.getEmailSecretaire(),
                demande.getLoginSecretaire(),
                demande.getDocumentLicence(),
                demande.getDocumentDiplome(),
                demande.getDocumentCinMedecin(),
                demande.getStatut(),
                demande.getCommentaireAdmin(),
                demande.getDateDemande(),
                demande.getDateTraitement()
        );
    }
}*/
package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.DemandeDTO;
import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.admin.DemandeCreationCabinetRepositoryAdmin;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeCreationCabinetService {

    private final DemandeCreationCabinetRepositoryAdmin demandeRepository;
    private final UtilisateurServiceAdmin utilisateurServiceAdmin;
    private final EmailService emailService;
    private final CabinetService cabinetService;

    public DemandeCreationCabinetService(DemandeCreationCabinetRepositoryAdmin demandeRepository,
                                         UtilisateurServiceAdmin utilisateurServiceAdmin,
                                         EmailService emailService,
                                         CabinetService cabinetService) {
        this.demandeRepository = demandeRepository;
        this.utilisateurServiceAdmin = utilisateurServiceAdmin;
        this.emailService = emailService;
        this.cabinetService = cabinetService;
    }

    public List<DemandeDTO> getAllDemandes() {
        return demandeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DemandeDTO> getDemandesByStatut(DemandeCreationCabinet.Statut statut) {
        return demandeRepository.findByStatut(statut).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void approuverDemande(Integer id, Utilisateur admin) {
        System.out.println("🔍 [APPROUVER] Début - ID: " + id + ", Admin: " + admin.getEmail());

        try {
            DemandeCreationCabinet demande = demandeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

            System.out.println("✅ [APPROUVER] Demande trouvée - Statut actuel: " + demande.getStatut());

            if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
                throw new RuntimeException("Demande déjà traitée");
            }

            System.out.println("📝 [APPROUVER] Création du cabinet...");
            cabinetService.creerCabinetEtUtilisateurs(demande);

            System.out.println("✅ [APPROUVER] Cabinet créé, mise à jour de la demande...");
            demande.setStatut(DemandeCreationCabinet.Statut.APPROUVEE);
            demande.setAdminTraitant(admin);
            demande.setDateTraitement(LocalDateTime.now());
            demandeRepository.save(demande);

            System.out.println("✅ [APPROUVER] Demande sauvegardée avec succès");
        } catch (Exception e) {
            System.err.println("❌ [APPROUVER] ERREUR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void rejeterDemande(Integer id, String commentaire, Utilisateur admin) {
        System.out.println("🔍 [REJETER] Début - ID: " + id);
        System.out.println("🔍 [REJETER] Admin: " + (admin != null ? admin.getEmail() : "NULL"));
        System.out.println("🔍 [REJETER] Commentaire: " + commentaire);

        try {
            DemandeCreationCabinet demande = demandeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

            System.out.println("✅ [REJETER] Demande trouvée - Statut: " + demande.getStatut());

            if (demande.getStatut() != DemandeCreationCabinet.Statut.EN_ATTENTE) {
                throw new RuntimeException("Demande déjà traitée");
            }

            System.out.println("📝 [REJETER] Mise à jour du statut...");
            demande.setStatut(DemandeCreationCabinet.Statut.REJETEE);
            demande.setCommentaireAdmin(commentaire);
            demande.setAdminTraitant(admin);
            demande.setDateTraitement(LocalDateTime.now());

            System.out.println("💾 [REJETER] Sauvegarde en base...");
            demandeRepository.save(demande);

            System.out.println("📧 [REJETER] Envoi email...");
            emailService.sendDemandeRefuseNotification(demande.getEmailMedecin(), commentaire);

            System.out.println("✅ [REJETER] Demande rejetée avec succès");
        } catch (Exception e) {
            System.err.println("❌ [REJETER] ERREUR: " + e.getMessage());
            System.err.println("❌ [REJETER] Type: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }

    private DemandeDTO toDTO(DemandeCreationCabinet demande) {
        Integer adminId = null;
        String adminNom = null;

        if (demande.getAdminTraitant() != null) {
            try {
                adminId = demande.getAdminTraitant().getId();
                adminNom = demande.getAdminTraitant().getNom() + " " +
                        demande.getAdminTraitant().getPrenom();
            } catch (Exception e) {
                System.err.println("⚠️ Impossible de charger l'admin traitant: " + e.getMessage());
            }
        }

        return new DemandeDTO(
                demande.getId(),
                demande.getNomCabinet(),
                demande.getSpecialite(),
                demande.getAdresseCabinet(),
                demande.getTelCabinet(),
                demande.getEmailCabinet(),
                demande.getLogoCabinet(),
                demande.getNomMedecin(),
                demande.getPrenomMedecin(),
                demande.getCinMedecin(),
                demande.getTelMedecin(),
                demande.getEmailMedecin(),
                demande.getLoginMedecin(),
                demande.getSignatureMedecin(),
                demande.getNomSecretaire(),
                demande.getPrenomSecretaire(),
                demande.getCinSecretaire(),
                demande.getTelSecretaire(),
                demande.getEmailSecretaire(),
                demande.getLoginSecretaire(),
                demande.getDocumentLicence(),
                demande.getDocumentDiplome(),
                demande.getDocumentCinMedecin(),
                demande.getStatut(),
                demande.getCommentaireAdmin(),
                demande.getDateDemande(),
                demande.getDateTraitement(),
                adminId,
                adminNom
        );
    }
}
