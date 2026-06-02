package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.admin.UtilisateurRepositoryAdmin;
import com.cabinetmedical.gestioncabinet.dto.admin.UtilisateurDTO;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.repository.admin.CabinetRepository;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurServiceAdmin {

    private final UtilisateurRepositoryAdmin utilisateurRepositoryAdmin;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; // Service pour envoyer les emails
    private final CabinetRepository cabinetRepository;

    public UtilisateurServiceAdmin(UtilisateurRepositoryAdmin utilisateurRepositoryAdmin,
                                   CabinetRepository cabinetRepository,
                                   PasswordEncoder passwordEncoder,
                                   EmailService emailService) {
        this.utilisateurRepositoryAdmin = utilisateurRepositoryAdmin;
        this.cabinetRepository = cabinetRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Méthode pour générer un mot de passe temporaire aléatoire
    private String generateTempPassword(int length) {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int idx = random.nextInt(chars.length());
            sb.append(chars.charAt(idx));
        }
        return sb.toString();
    }

    // Crée un utilisateur, génère mot de passe temporaire, l'encode, sauvegarde et envoie par email
    public Utilisateur creerUtilisateur(Utilisateur utilisateur, String nomCabinet) {

        if (utilisateurRepositoryAdmin.existsByLogin(utilisateur.getLogin())) {
            throw new RuntimeException("Un utilisateur avec ce login existe déjà.");
        }

        // 🔍 Trouver le cabinet par NOM
        Cabinet cabinet = cabinetRepository
                .findByNomAndActifTrue(nomCabinet)
                .orElseThrow(() ->
                        new RuntimeException("Cabinet introuvable ou inactif : " + nomCabinet)
                );

        utilisateur.setCabinet(cabinet);

        // 🔗 Associer l'utilisateur au cabinet
        utilisateur.setCabinet(cabinet);

        // Générer un mot de passe temporaire (ici 8 caractères)
        String tempPwd = generateTempPassword(8);

        // Encoder le mot de passe avant de le stocker
        utilisateur.setPwd(passwordEncoder.encode(tempPwd));

        // Soft delete actif par défaut
        utilisateur.setActif(true);
        // Statut par défaut
        utilisateur.setStatut("INACTIF");

        // Sauvegarder l'utilisateur
        Utilisateur saved = utilisateurRepositoryAdmin.save(utilisateur);

        // Envoyer le mot de passe temporaire par email
        try {
            emailService.sendTemporaryPassword(saved.getLogin(), tempPwd);
        } catch (Exception e) {
            throw new RuntimeException("Utilisateur créé mais envoi email échoué : " + e.getMessage(), e);
        }

        return saved;
    }

    // Récupérer tous les utilisateurs
    public List<Utilisateur> getAllUtilisateursActifs() {
        return utilisateurRepositoryAdmin.findByActifTrue();
    }


    public List<UtilisateurDTO> getAllUtilisateursActifsDTO() {
        return utilisateurRepositoryAdmin.findByActifTrue()
                .stream()
                .map(u -> new UtilisateurDTO(
                        u.getId(),
                        u.getLogin(),
                        u.getNom(),
                        u.getPrenom(),
                        u.getNumTel(),
                        u.getRole(),
                        u.getActif(),
                        u.getStatut(),
                        u.getCabinet() != null ? u.getCabinet().getNom() : null
                ))
                .toList();
    }


    // Récupérer un utilisateur par ID
    public Optional<Utilisateur> getUtilisateurById(Integer id) {
        return utilisateurRepositoryAdmin.findById(id);
    }

    // Mettre à jour un utilisateur
    public Utilisateur updateUtilisateur(Integer id, Utilisateur update) {
        Utilisateur exist = utilisateurRepositoryAdmin.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        exist.setNom(update.getNom());
        exist.setPrenom(update.getPrenom());
        exist.setNumTel(update.getNumTel());
        exist.setRole(update.getRole());
        exist.setStatut(update.getStatut()); // Mettre à jour le statut (ACTIF / INACTIF)
        exist.setSignature(update.getSignature());
        return utilisateurRepositoryAdmin.save(exist);
    }
// delete user
    public void supprimerUtilisateur(Integer id) {
        utilisateurRepositoryAdmin.findById(id).ifPresent(u -> {
            u.setActif(false); // soft delete
            utilisateurRepositoryAdmin.save(u);
        });
    }


    // Désactiver un utilisateur
    public void desactiverUtilisateur(Integer id) {
        utilisateurRepositoryAdmin.findById(id).ifPresent(u -> {
            u.setStatut("INACTIF");
            utilisateurRepositoryAdmin.save(u);
        });
    }

    // Activer un utilisateur
    public void activerUtilisateur(Integer id) {
        utilisateurRepositoryAdmin.findById(id).ifPresent(u -> {
            u.setStatut("ACTIF");
            utilisateurRepositoryAdmin.save(u);
        });
    }
}
