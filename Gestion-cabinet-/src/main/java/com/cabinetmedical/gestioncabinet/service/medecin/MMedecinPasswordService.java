package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MChangePasswordRequest;
import com.cabinetmedical.gestioncabinet.dto.medecin.MChangePasswordResponse;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import com.cabinetmedical.gestioncabinet.security.medecin.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class MMedecinPasswordService {

    private final UtilisateurmedRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Change le mot de passe du médecin connecté
     */
    @Transactional
    public MChangePasswordResponse changePassword(MChangePasswordRequest request) {
        log.info("🔐 [PasswordService] Début changement de mot de passe");

        try {
            // 1. Récupérer l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
                log.error("❌ [PasswordService] Utilisateur non authentifié");
                return createErrorResponse("Utilisateur non authentifié");
            }

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Integer userId = userPrincipal.getId();

            log.info("👤 [PasswordService] Utilisateur ID: {}, Login: {}", userId, userPrincipal.getUsername());

            // 2. Charger l'utilisateur depuis la base de données
            Utilisateur utilisateur = utilisateurRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("❌ [PasswordService] Utilisateur non trouvé avec ID: {}", userId);
                        return new RuntimeException("Utilisateur non trouvé");
                    });

            // 3. Vérifier que c'est bien un médecin
            if (utilisateur.getRole() != Utilisateur.Role.MEDECIN) {
                log.error("❌ [PasswordService] L'utilisateur n'est pas un médecin: {}", utilisateur.getRole());
                return createErrorResponse("Action non autorisée pour ce rôle");
            }

            // 4. Vérifier que les nouveaux mots de passe correspondent
            if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
                log.warn("⚠️ [PasswordService] Les mots de passe ne correspondent pas");
                return createErrorResponse("Les nouveaux mots de passe ne correspondent pas");
            }

            // 5. Vérifier l'ancien mot de passe
            if (!passwordEncoder.matches(request.getAncienMotDePasse(), utilisateur.getPwd())) {
                log.warn("⚠️ [PasswordService] Ancien mot de passe incorrect pour utilisateur: {}", userId);
                return createErrorResponse("L'ancien mot de passe est incorrect");
            }

            // 6. Vérifier que le nouveau mot de passe est différent de l'ancien
            if (passwordEncoder.matches(request.getNouveauMotDePasse(), utilisateur.getPwd())) {
                log.warn("⚠️ [PasswordService] Le nouveau mot de passe est identique à l'ancien");
                return createErrorResponse("Le nouveau mot de passe doit être différent de l'ancien");
            }

            // 7. Valider la force du nouveau mot de passe
            String validationError = validatePasswordStrength(request.getNouveauMotDePasse());
            if (validationError != null) {
                log.warn("⚠️ [PasswordService] Mot de passe faible: {}", validationError);
                return createErrorResponse(validationError);
            }

            // 8. Encoder et sauvegarder le nouveau mot de passe
            String encodedPassword = passwordEncoder.encode(request.getNouveauMotDePasse());
            utilisateur.setPwd(encodedPassword);
            utilisateurRepository.save(utilisateur);

            log.info("✅ [PasswordService] Mot de passe changé avec succès pour utilisateur: {}", userId);

            return MChangePasswordResponse.builder()
                    .success(true)
                    .message("Mot de passe modifié avec succès")
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();

        } catch (Exception e) {
            log.error("❌ [PasswordService] Erreur lors du changement de mot de passe: {}", e.getMessage(), e);
            return createErrorResponse("Erreur lors du changement de mot de passe: " + e.getMessage());
        }
    }

    /**
     * Valide la force du mot de passe
     */
    private String validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères";
        }

        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);

        if (!hasUpper) {
            return "Le mot de passe doit contenir au moins une lettre majuscule";
        }
        if (!hasLower) {
            return "Le mot de passe doit contenir au moins une lettre minuscule";
        }
        if (!hasDigit) {
            return "Le mot de passe doit contenir au moins un chiffre";
        }
        if (!hasSpecial) {
            return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)";
        }

        return null; // Mot de passe valide
    }

    /**
     * Crée une réponse d'erreur
     */
    private MChangePasswordResponse createErrorResponse(String message) {
        return MChangePasswordResponse.builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    /**
     * Récupère les informations du médecin connecté
     */
    public Utilisateur getCurrentMedecin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return utilisateurRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}