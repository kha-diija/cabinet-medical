package com.cabinetmedical.gestioncabinet.service.impl;

import com.cabinetmedical.gestioncabinet.config.JwtService;
import com.cabinetmedical.gestioncabinet.dto.LoginRequest;
import com.cabinetmedical.gestioncabinet.dto.LoginResponse;
import com.cabinetmedical.gestioncabinet.dto.RegisterRequest;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.CabinetsRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.AuthService;
import com.cabinetmedical.gestioncabinet.service.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final CabinetsRepository cabinetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final LoginAttemptService loginAttemptService;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 🔥 VÉRIFICATION RATE LIMITING : EST-CE QUE L'UTILISATEUR EST BLOQUÉ ?
        if (loginAttemptService.isBlocked(request.getLogin())) {
            throw new RuntimeException("Trop de tentatives échouées. Veuillez patienter 1 minute.");
        }

        Utilisateur utilisateur;

        // 1. Conversion du rôle string en enum
        Utilisateur.Role roleEnum;
        try {
            roleEnum = Utilisateur.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide: " + request.getRole());
        }

        // 2. Récupération de l'utilisateur (Support Login OU Email)
        if (roleEnum == Utilisateur.Role.ADMINISTRATEUR) {
            // Pour ADMINISTRATEUR, pas besoin de cabinet
            utilisateur = utilisateurRepository.findByIdentifiantAndRole(request.getLogin(), roleEnum)
                    .orElseThrow(() -> new RuntimeException("Identifiants invalides"));
        } else {
            // Pour MEDECIN et SECRETAIRE, le cabinet est obligatoire
            if (request.getCabinetId() == null) {
                throw new RuntimeException("Le cabinet est obligatoire pour ce rôle");
            }

            // Nouvelle méthode qui cherche par Login OU Email dans le cabinet spécifié
            utilisateur = utilisateurRepository.findByIdentifiantAndRoleAndCabinet(
                            request.getLogin(), roleEnum, request.getCabinetId())
                    .orElseThrow(() -> new RuntimeException("Identifiants invalides ou cabinet incorrect"));
        }

        // 3. Vérifier si l'utilisateur est actif
        if (!utilisateur.getActif()) {
            throw new RuntimeException("Votre demande est en cours de traitement par l'administrateur.");
        }

        // 4. Vérifier si le cabinet est actif (Pour médecins et secrétaires)
        if (utilisateur.getCabinet() != null) {
            if (!utilisateur.getCabinet().isActif()) {
                throw new RuntimeException("Accès restreint. Veuillez régulariser votre abonnement pour accéder à la plateforme.");
            }
        }

        // 5. Authentification Spring Security
        // Note: On utilise le vrai login récupéré de la BDD car request.getLogin() pourrait être un email
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(utilisateur.getLogin(), request.getPassword())
            );
            // ✅ Authentification réussie : réinitialiser le compteur d'échecs
            loginAttemptService.loginSucceeded(request.getLogin());
        } catch (Exception e) {
            // ❌ Authentification échouée : enregistrer la tentative
            loginAttemptService.loginFailed(request.getLogin());
            throw new RuntimeException("Mot de passe incorrect");
        }

        // 6. Générer le token avec le rôle dans les claims
        UserDetails userDetails = User.builder()
                .username(utilisateur.getLogin())
                .password(utilisateur.getPwd())
                .authorities("ROLE_" + utilisateur.getRole().name())
                .build();

        // ✅ AJOUT: Ajouter le rôle et autres infos dans les claims du token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ROLE_" + utilisateur.getRole().name());
        extraClaims.put("userId", utilisateur.getId());
        extraClaims.put("cabinetId", utilisateur.getCabinet() != null ? utilisateur.getCabinet().getId() : null);

        String token = jwtService.generateToken(extraClaims, userDetails);

        // 7. Construire la réponse
        return LoginResponse.builder()
                .token(token)
                .userId(utilisateur.getId())
                .login(utilisateur.getLogin())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .cabinetId(utilisateur.getCabinet() != null ? utilisateur.getCabinet().getId() : null)
                .cabinetName(utilisateur.getCabinet() != null ? utilisateur.getCabinet().getNom() : null)
                .build();
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // 1. Vérifier si le login existe déjà
        if (utilisateurRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("Ce login est déjà utilisé");
        }

        // 2. Vérifier si l'email existe déjà (si fourni)
        if (request.getEmail() != null && utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // 3. Convertir le rôle string en enum
        Utilisateur.Role roleEnum;
        try {
            roleEnum = Utilisateur.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide: " + request.getRole());
        }

        // 4. Créer l'utilisateur
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setLogin(request.getLogin());

        // Ajouter l'email s'il est fourni dans la request
        if (request.getEmail() != null) {
            utilisateur.setEmail(request.getEmail());
        }

        utilisateur.setPwd(passwordEncoder.encode(request.getPassword()));
        utilisateur.setRole(roleEnum);
        utilisateur.setNumTel(request.getNumTel());
        utilisateur.setSignature(request.getSignature());

        // IMPORTANT : Inscription = Compte inactif par défaut (en attente validation)
        utilisateur.setActif(false);

        // 5. Associer le cabinet si nécessaire
        if (request.getCabinetId() != null) {
            Cabinet cabinet = cabinetRepository.findById(request.getCabinetId())
                    .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
            utilisateur.setCabinet(cabinet);
        } else if (roleEnum != Utilisateur.Role.ADMINISTRATEUR) {
            throw new RuntimeException("Le cabinet est obligatoire pour ce rôle");
        }

        utilisateur = utilisateurRepository.save(utilisateur);

        // 6. Construire la réponse SANS token car le compte n'est pas encore actif
        // (L'utilisateur devra attendre la validation par l'administrateur)
        return LoginResponse.builder()
                .userId(utilisateur.getId())
                .login(utilisateur.getLogin())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .cabinetId(utilisateur.getCabinet() != null ? utilisateur.getCabinet().getId() : null)
                .cabinetName(utilisateur.getCabinet() != null ? utilisateur.getCabinet().getNom() : null)
                .build();
    }
}