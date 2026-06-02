package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.model.PasswordResetToken;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.PasswordResetTokenRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Recommandé pour les delete

import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private JavaMailSender mailSender;
    @Autowired private PasswordEncoder passwordEncoder;

    // Étape 1 & 2 : Générer token et envoyer mail
    @Transactional // Ajouté pour s'assurer que le delete + insert se fait atomiquement
    public void processForgotPassword(String email) {
        // 1. On cherche l'utilisateur par son email
        Optional<Utilisateur> userOptional = utilisateurRepository.findByEmail(email);

        // 2. On entre dans la logique SEULEMENT si l'utilisateur existe
        if (userOptional.isPresent()) {
            Utilisateur user = userOptional.get();

            // 3. Maintenant on vérifie s'il y a déjà un token pour cet utilisateur
            Optional<PasswordResetToken> existingToken = tokenRepository.findByUtilisateur(user);

            // 4. Si oui, on le supprime (Nettoyage)
            if (existingToken.isPresent()) {
                tokenRepository.delete(existingToken.get());
                tokenRepository.flush(); // Force la suppression immédiate
            }

            // 5. Génération du NOUVEAU Token
            String token = UUID.randomUUID().toString();

            // 6. Sauvegarde en BDD
            PasswordResetToken myToken = new PasswordResetToken(token, user);
            tokenRepository.save(myToken);

            // 7. Envoi Email
            sendResetEmail(user.getEmail(), token);
        }
        // Si l'utilisateur n'existe pas, on ne fait rien (sécurité silencieuse)
    }

    // Étape 3 : Valider le token
    public boolean validatePasswordResetToken(String token) {
        return tokenRepository.findByTokenAndUsedFalse(token)
                .map(t -> !t.isExpired())
                .orElse(false);
    }

    // Étape Finale : Changer le mot de passe
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Token expiré");
        }

        Utilisateur user = resetToken.getUtilisateur();

        // Hashage du mot de passe
        user.setPwd(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);

        // Invalider le token
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private void sendResetEmail(String email, String token) {
        // Assurez-vous que l'URL correspond bien à votre Frontend React
        String url = "http://localhost:5173/reset-password?token=" + token;

        SimpleMailMessage emailMessage = new SimpleMailMessage();
        emailMessage.setTo(email);
        emailMessage.setSubject("Réinitialisation de mot de passe - Cabinet Médical");
        emailMessage.setText("Bonjour " + email + ",\n\n" +
                "Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous :\n" +
                url + "\n\n" +
                "Ce lien expirera dans 15 minutes.");

        mailSender.send(emailMessage);
    }
}