package com.cabinetmedical.gestioncabinet.security.medecin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilisateurmedRepository utilisateurRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        log.debug("🔍 [UserDetailsService] Chargement utilisateur: {}", login);

        Utilisateur utilisateur = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> {
                    log.error("❌ [UserDetailsService] Utilisateur non trouvé: {}", login);
                    return new UsernameNotFoundException("Utilisateur non trouvé avec login: " + login);
                });

        if (utilisateur.getActif() == null || !utilisateur.getActif()) {
            log.error("❌ [UserDetailsService] Compte désactivé: {}", login);
            throw new UsernameNotFoundException("Compte désactivé");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(utilisateur);

        // ✅ UTILISER userPrincipal.getUsername() au lieu de userPrincipal.getLogin()
        log.info("✅ [UserDetailsService] UserPrincipal créé - ID: {}, Login: {}, Role: {}, CabinetId: {}",
                userPrincipal.getId(),
                userPrincipal.getUsername(),  // Changé ici
                userPrincipal.getRole(),
                userPrincipal.getCabinetId());

        return userPrincipal;
    }

    @Transactional
    public UserDetails loadUserById(Integer id) {
        log.debug("🔍 [UserDetailsService] Chargement utilisateur par ID: {}", id);

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ [UserDetailsService] Utilisateur non trouvé avec ID: {}", id);
                    return new UsernameNotFoundException("Utilisateur non trouvé avec id: " + id);
                });

        UserPrincipal userPrincipal = UserPrincipal.create(utilisateur);

        // ✅ UTILISER userPrincipal.getUsername() au lieu de userPrincipal.getLogin()
        log.info("✅ [UserDetailsService] UserPrincipal créé - ID: {}, Login: {}",
                userPrincipal.getId(),
                userPrincipal.getUsername());  // Changé ici

        return userPrincipal;
    }
}