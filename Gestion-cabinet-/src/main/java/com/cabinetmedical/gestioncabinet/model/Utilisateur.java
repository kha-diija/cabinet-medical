package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;  // ✅ AJOUTEZ CET IMPORT
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 50)
    private String login;

    // 🔥 AJOUT DU CHAMP EMAIL POUR LA CONNEXION HYBRIDE
    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String pwd;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(name = "num_tel", length = 20)
    private String numTel;

    @Column(length = 255)
    private String signature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean actif = true;

    @Column(nullable = false, length = 20)
    private String statut = "ACTIF";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet", foreignKey = @ForeignKey(name = "FK_Utilisateur_Cabinet"))
    @JsonBackReference("cabinet-users")
    private Cabinet cabinet;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    // ✅ AJOUTEZ @JsonIgnore SUR TOUTES CES LISTES
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<RendezVous> rendezVous;

    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Consultation> consultations;

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Notification> notifications;

    @OneToMany(mappedBy = "expediteur", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Messagerie> messagesEnvoyes;

    @OneToMany(mappedBy = "destinataire", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Messagerie> messagesRecus;

    public Integer getIdUtilisateur() {
        return id;
    }


    public enum Role {
        MEDECIN, SECRETAIRE, ADMINISTRATEUR
    }

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (actif == null) {
            actif = true;
        }
        if (statut == null) {
            statut = "ACTIF";
        }
    }
}