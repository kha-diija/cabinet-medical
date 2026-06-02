package com.cabinetmedical.gestioncabinet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Demande_Creation_Cabinet", indexes = {
        @Index(name = "idx_demande_statut", columnList = "statut"),
        @Index(name = "idx_demande_date", columnList = "date_demande")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DemandeCreationCabinet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Informations du Cabinet
    @Column(name = "nom_cabinet", nullable = false, length = 100)
    private String nomCabinet;

    @Column(length = 100)
    private String specialite;

    @Column(name = "adresse_cabinet", nullable = false, length = 255)
    private String adresseCabinet;

    @Column(name = "tel_cabinet", nullable = false, length = 20)
    private String telCabinet;

    @Column(name = "email_cabinet", length = 100)
    private String emailCabinet;

    @Column(name = "logo_cabinet", length = 255)
    private String logoCabinet;

    // Informations du Médecin
    @Column(name = "nom_medecin", nullable = false, length = 100)
    private String nomMedecin;

    @Column(name = "prenom_medecin", nullable = false, length = 100)
    private String prenomMedecin;

    @Column(name = "cin_medecin", nullable = false, length = 20)
    private String cinMedecin;

    @Column(name = "tel_medecin", nullable = false, length = 20)
    private String telMedecin;

    @Column(name = "email_medecin", nullable = false, length = 100)
    private String emailMedecin;

    @Column(name = "login_medecin", nullable = false, length = 50)
    private String loginMedecin;

    @Column(name = "pwd_medecin", nullable = false, length = 255)
    private String pwdMedecin;

    @Column(name = "signature_medecin", length = 255)
    private String signatureMedecin;

    // Informations de la Secrétaire (optionnelles)
    @Column(name = "nom_secretaire", length = 100)
    private String nomSecretaire;

    @Column(name = "prenom_secretaire", length = 100)
    private String prenomSecretaire;

    @Column(name = "cin_secretaire", length = 20)
    private String cinSecretaire;

    @Column(name = "tel_secretaire", length = 20)
    private String telSecretaire;

    @Column(name = "email_secretaire", length = 100)
    private String emailSecretaire;

    @Column(name = "login_secretaire", length = 50)
    private String loginSecretaire;

    @Column(name = "pwd_secretaire", length = 255)
    private String pwdSecretaire;

    // Informations de la demande
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Statut statut = Statut.EN_ATTENTE;

    @Column(name = "date_demande", nullable = false)
    private LocalDateTime dateDemande = LocalDateTime.now();

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "commentaire_admin", columnDefinition = "TEXT")
    private String commentaireAdmin;

    // ✅ SOLUTION : Ignorer complètement adminTraitant lors de la sérialisation JSON
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_admin_traitant",
            foreignKey = @ForeignKey(name = "FK_Demande_AdminTraitant"))
    @JsonIgnore // ✅ N'essaie même pas de sérialiser cette relation
    private Utilisateur adminTraitant;

    // Documents justificatifs
    @Column(name = "document_licence", length = 255)
    private String documentLicence;

    @Column(name = "document_diplome", length = 255)
    private String documentDiplome;

    @Column(name = "document_cin_medecin", length = 255)
    private String documentCinMedecin;

    public enum Statut {
        EN_ATTENTE, APPROUVEE, REJETEE
    }

    @PrePersist
    protected void onCreate() {
        dateDemande = LocalDateTime.now();
        if (statut == null) {
            statut = Statut.EN_ATTENTE;
        }
    }
}