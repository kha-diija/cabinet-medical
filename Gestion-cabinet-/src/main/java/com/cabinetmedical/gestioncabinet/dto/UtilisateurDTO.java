package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO pour les utilisateurs - Version simplifiée pour éviter les références circulaires
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UtilisateurDTO {
    private Integer id;
    private String login;
    private String nom;
    private String prenom;
    private String numTel;
    private String role;
    private Boolean actif;
    private LocalDate dateCreation;

    // ✅ Informations du cabinet (simplifiées)
    private Integer idCabinet;
    private String nomCabinet;

    // ✅ Informations supplémentaires (optionnelles)
    private String email;
    private String specialite; // Pour les médecins

    // ✅ Constructeur minimal pour les listes de médecins
    public UtilisateurDTO(Integer id, String nom, String prenom, String role) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.role = role;
    }

    // ✅ Constructeur complet
    public UtilisateurDTO(Integer id, String login, String nom, String prenom,
                          String numTel, String role, Boolean actif,
                          Integer idCabinet, String nomCabinet) {
        this.id = id;
        this.login = login;
        this.nom = nom;
        this.prenom = prenom;
        this.numTel = numTel;
        this.role = role;
        this.actif = actif;
        this.idCabinet = idCabinet;
        this.nomCabinet = nomCabinet;
    }

    // Constructeur par défaut requis par Jackson
    public UtilisateurDTO() {
    }
}