package com.cabinetmedical.gestioncabinet.config;

import com.cabinetmedical.gestioncabinet.repository.admin.UtilisateurRepositoryAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UtilisateurRepositoryAdmin utilisateurRepositoryAdmin;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> utilisateurRepositoryAdmin.findByLogin(username)
                .map(utilisateur -> org.springframework.security.core.userdetails.User.builder()
                        .username(utilisateur.getLogin())
                        .password(utilisateur.getPwd())
                        .authorities("ROLE_" + utilisateur.getRole().name())
                        .disabled(!utilisateur.getActif())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}