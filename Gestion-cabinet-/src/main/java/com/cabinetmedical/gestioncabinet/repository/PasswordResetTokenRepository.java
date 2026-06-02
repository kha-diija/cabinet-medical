package com.cabinetmedical.gestioncabinet.repository;


import com.cabinetmedical.gestioncabinet.model.PasswordResetToken;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<String> findByToken(String token); // Change retour en Optional<PasswordResetToken> si besoin
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    Optional<PasswordResetToken> findByUtilisateur(Utilisateur utilisateur);
}