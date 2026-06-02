package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.admin.CabinetRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CabinetService {

    private final CabinetRepository cabinetRepository;
    private final AdminFactureService adminFactureService;
    private final UtilisateurServiceAdmin utilisateurServiceAdmin;
    private final UtilisateurRepository utilisateurRepository;

    public CabinetService(CabinetRepository cabinetRepository,
                          AdminFactureService adminFactureService,
                          UtilisateurServiceAdmin utilisateurServiceAdmin,
                          UtilisateurRepository utilisateurRepository) {
        this.cabinetRepository = cabinetRepository;
        this.adminFactureService = adminFactureService;
        this.utilisateurServiceAdmin = utilisateurServiceAdmin;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Cabinet> getAllCabinets() {
        return cabinetRepository.findAll();
    }

    public Optional<Cabinet> getCabinetById(Integer id) {
        return cabinetRepository.findById(id);
    }

    public Cabinet addCabinet(Cabinet cabinet) {
        cabinet.setActif(false);
        return cabinetRepository.save(cabinet);
    }

    // ✅ MÉTHODE CORRIGÉE avec gestion des doublons et transaction
    @Transactional(rollbackFor = Exception.class)
    public Cabinet creerCabinetEtUtilisateurs(DemandeCreationCabinet demande) {
        System.out.println("🔍 [CREATION] Vérification des doublons...");

        // ✅ 1. Vérifier si le cabinet existe déjà (par nom)
        Optional<Cabinet> cabinetExistant = cabinetRepository
                .findByNomIgnoreCase(demande.getNomCabinet());

        if (cabinetExistant.isPresent()) {
            throw new IllegalStateException(
                    "❌ Un cabinet avec le nom '" + demande.getNomCabinet() + "' existe déjà."
            );
        }

        // ✅ 2. Vérifier si l'email du médecin existe déjà
        Optional<Utilisateur> medecinExistant = utilisateurRepository
                .findByEmail(demande.getEmailMedecin());

        if (medecinExistant.isPresent()) {
            throw new IllegalStateException(
                    "❌ Un utilisateur avec l'email '" + demande.getEmailMedecin() + "' existe déjà."
            );
        }

        // ✅ 3. Vérifier si le login du médecin existe déjà
        Optional<Utilisateur> loginMedecinExistant = utilisateurRepository
                .findByLogin(demande.getLoginMedecin());

        if (loginMedecinExistant.isPresent()) {
            throw new IllegalStateException(
                    "❌ Un utilisateur avec le login '" + demande.getLoginMedecin() + "' existe déjà."
            );
        }

        // ✅ 4. Vérifier les infos de la secrétaire si présentes
        if (demande.getEmailSecretaire() != null && !demande.getEmailSecretaire().isEmpty()) {
            Optional<Utilisateur> secretaireExistant = utilisateurRepository
                    .findByEmail(demande.getEmailSecretaire());

            if (secretaireExistant.isPresent()) {
                throw new IllegalStateException(
                        "❌ Un utilisateur avec l'email '" + demande.getEmailSecretaire() + "' existe déjà."
                );
            }

            if (demande.getLoginSecretaire() != null) {
                Optional<Utilisateur> loginSecretaireExistant = utilisateurRepository
                        .findByLogin(demande.getLoginSecretaire());

                if (loginSecretaireExistant.isPresent()) {
                    throw new IllegalStateException(
                            "❌ Un utilisateur avec le login '" + demande.getLoginSecretaire() + "' existe déjà."
                    );
                }
            }
        }

        System.out.println("✅ [CREATION] Aucun doublon détecté, création en cours...");

        // 1️⃣ Créer le cabinet
        Cabinet cabinet = new Cabinet();
        cabinet.setNom(demande.getNomCabinet());
        cabinet.setAdresse(demande.getAdresseCabinet());
        cabinet.setTel(demande.getTelCabinet());
        cabinet.setEmail(demande.getEmailCabinet());
        cabinet.setLogo(demande.getLogoCabinet());
        cabinet.setSpecialite(demande.getSpecialite());
        cabinet.setActif(true);

        Cabinet savedCabinet = cabinetRepository.save(cabinet);
        System.out.println("✅ [CREATION] Cabinet créé avec ID: " + savedCabinet.getId());

        // 2️⃣ Créer l'utilisateur médecin
        Utilisateur medecin = new Utilisateur();
        medecin.setNom(demande.getNomMedecin());
        medecin.setPrenom(demande.getPrenomMedecin());
        medecin.setLogin(demande.getLoginMedecin());
        medecin.setEmail(demande.getEmailMedecin());
        medecin.setNumTel(demande.getTelMedecin());
        medecin.setRole(Utilisateur.Role.MEDECIN);
        medecin.setSignature(demande.getSignatureMedecin());
        utilisateurServiceAdmin.creerUtilisateur(medecin, savedCabinet.getNom());
        System.out.println("✅ [CREATION] Médecin créé");

        // 3️⃣ Créer l'utilisateur secrétaire si infos présentes
        if (demande.getNomSecretaire() != null && !demande.getNomSecretaire().isEmpty()) {
            Utilisateur secretaire = new Utilisateur();
            secretaire.setNom(demande.getNomSecretaire());
            secretaire.setPrenom(demande.getPrenomSecretaire());
            secretaire.setLogin(demande.getLoginSecretaire());
            secretaire.setEmail(demande.getEmailSecretaire());
            secretaire.setNumTel(demande.getTelSecretaire());
            secretaire.setRole(Utilisateur.Role.SECRETAIRE);
            utilisateurServiceAdmin.creerUtilisateur(secretaire, savedCabinet.getNom());
            System.out.println("✅ [CREATION] Secrétaire créée");
        }

        // 4️⃣ Créer la facture initiale pour le cabinet
        adminFactureService.createFactureForCabinet(savedCabinet);
        System.out.println("✅ [CREATION] Facture créée");

        return savedCabinet;
    }

    public Cabinet updateCabinet(Integer id, Cabinet cabinetDetails) {
        Cabinet cabinet = getCabinetById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));

        cabinet.setNom(cabinetDetails.getNom());
        cabinet.setAdresse(cabinetDetails.getAdresse());
        cabinet.setEmail(cabinetDetails.getEmail());
        cabinet.setTel(cabinetDetails.getTel());
        cabinet.setLogo(cabinetDetails.getLogo());
        cabinet.setSpecialite(cabinetDetails.getSpecialite());

        return cabinetRepository.save(cabinet);
    }

    public Cabinet toggleCabinetStatus(Integer id, Boolean actif) {
        Cabinet cabinet = getCabinetById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));

        boolean etatPrecedent = cabinet.getActif();
        cabinet.setActif(actif);
        Cabinet savedCabinet = cabinetRepository.save(cabinet);

        if (!etatPrecedent && actif) {
            adminFactureService.createFactureForCabinet(savedCabinet);
        }

        return savedCabinet;
    }

    public List<Cabinet> searchByNom(String nom) {
        return cabinetRepository.findByNomContainingIgnoreCase(nom);
    }
}