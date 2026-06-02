package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = Utilisateur.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private Utilisateur utilisateur;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used;

    public PasswordResetToken(String token, Utilisateur utilisateur) {
        this.token = token;
        this.utilisateur = utilisateur;
        this.expiryDate = LocalDateTime.now().plusMinutes(15); // Expire dans 15 min
        this.used = false;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}