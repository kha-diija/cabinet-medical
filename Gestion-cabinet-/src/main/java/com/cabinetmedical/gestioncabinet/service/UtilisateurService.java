package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.ChangePasswordDTO;
import com.cabinetmedical.gestioncabinet.dto.ProfileDTO;
import com.cabinetmedical.gestioncabinet.exception.ResourceNotFoundException;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Trouve un utilisateur par son login
     */
    public Utilisateur findByLogin(String login) {
        return utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec le login: " + login));
    }

    /**
     * ✅ Met à jour le profil de l'utilisateur
     */
    public Utilisateur updateProfile(String login, ProfileDTO profileDTO) {
        Utilisateur utilisateur = findByLogin(login);

        // Mettre à jour uniquement les champs autorisés
        if (profileDTO.getNom() != null && !profileDTO.getNom().trim().isEmpty()) {
            utilisateur.setNom(profileDTO.getNom().trim());
        }

        if (profileDTO.getPrenom() != null && !profileDTO.getPrenom().trim().isEmpty()) {
            utilisateur.setPrenom(profileDTO.getPrenom().trim());
        }

        if (profileDTO.getNumTel() != null && !profileDTO.getNumTel().trim().isEmpty()) {
            utilisateur.setNumTel(profileDTO.getNumTel().trim());
        }

        // Ne pas permettre la modification du login depuis le profil
        // Le login est l'identifiant unique et ne doit pas changer

        return utilisateurRepository.save(utilisateur);
    }

    /**
     * ✅ Change le mot de passe de l'utilisateur
     */
    public void changePassword(String login, ChangePasswordDTO passwordDTO) {
        Utilisateur utilisateur = findByLogin(login);

        // Vérifier que l'ancien mot de passe est correct
        if (!passwordEncoder.matches(passwordDTO.getOldPassword(), utilisateur.getPwd())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect");
        }

        // Vérifier que les nouveaux mots de passe correspondent
        if (!passwordDTO.getNewPassword().equals(passwordDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("Les nouveaux mots de passe ne correspondent pas");
        }

        // Vérifier la longueur minimale du nouveau mot de passe
        if (passwordDTO.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
        }

        // Encoder et sauvegarder le nouveau mot de passe
        utilisateur.setPwd(passwordEncoder.encode(passwordDTO.getNewPassword()));
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Active ou désactive un utilisateur
     */
    public void toggleActif(Integer utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        utilisateur.setActif(!utilisateur.getActif());
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Vérifie si un login existe déjà
     */
    public boolean loginExists(String login) {
        return utilisateurRepository.existsByLogin(login);
    }
}