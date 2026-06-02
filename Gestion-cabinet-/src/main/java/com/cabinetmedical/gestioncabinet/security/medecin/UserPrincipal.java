package com.cabinetmedical.gestioncabinet.security.medecin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;  // ✅ Changez entity par model
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Implémentation personnalisée de UserDetails pour Spring Security
 * Contient les informations nécessaires pour l'authentification et l'autorisation
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String login;
    private final String password;
    private final String role;
    private final Integer cabinetId;
    private final boolean actif;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Constructeur à partir d'une entité Utilisateur
     */
    public UserPrincipal(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.login = utilisateur.getLogin();
        this.password = utilisateur.getPwd();
        this.role = utilisateur.getRole().name();
        this.cabinetId = utilisateur.getCabinet() != null ? utilisateur.getCabinet().getId() : null;
        this.actif = utilisateur.getActif();

        // Créer l'autorité avec le préfixe ROLE_
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name())
        );
    }

    /**
     * Factory method pour créer un UserPrincipal
     */
    public static UserPrincipal create(Utilisateur utilisateur) {
        return new UserPrincipal(utilisateur);
    }

    // Implémentation de UserDetails

    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return actif;
    }

    // Méthodes utilitaires

    public boolean hasRole(String role) {
        return this.role.equals(role);
    }

    @Override
    public String toString() {
        return "UserPrincipal{" +
                "id=" + id +
                ", login='" + login + '\'' +
                ", role='" + role + '\'' +
                ", cabinetId=" + cabinetId +
                ", actif=" + actif +
                '}';
    }
}