package com.cabinetmedical.gestioncabinet.dto.admin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;

public class UtilisateurDTO {

    private Integer id;               // ✅ Identifiant unique de l'utilisateur
    private String login;             // ✅ Login/email utilisé pour la connexion
    private String nom;               // ✅ Nom de l'utilisateur
    private String prenom;            // ✅ Prénom de l'utilisateur
    private String numTel;            // ✅ Numéro de téléphone
    private Utilisateur.Role role;    // ✅ Rôle de l'utilisateur (MEDECIN, SECRETAIRE, ADMINISTRATEUR)
    private Boolean actif;// ✅ Indique si l'utilisateur peut se connecter ou non
    private String  statut;
    private String nomCabinet;
    // Constructeur vide requis par Spring pour la sérialisation/désérialisation JSON
    public UtilisateurDTO() {}

    // Constructeur avec tous les champs pour faciliter la création de DTO
    public UtilisateurDTO(Integer id, String login, String nom, String prenom, String numTel, Utilisateur.Role role, Boolean actif , String statut , String nomCabinet) {
        this.id = id;
        this.login = login;
        this.nom = nom;
        this.prenom = prenom;
        this.numTel = numTel;
        this.role = role;
        this.actif = actif;
        this.statut = statut;
        this.nomCabinet = nomCabinet;
    }

    // Getters et Setters pour tous les champs

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNumTel() {
        return numTel;
    }

    public void setNumTel(String numTel) {
        this.numTel = numTel;
    }

    public Utilisateur.Role getRole() {
        return role;
    }

    public void setRole(Utilisateur.Role role) {
        this.role = role;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getNomCabinet() {
        return nomCabinet;
    }
    public void setNomCabinet(String nomCabinet) {
        this.nomCabinet = nomCabinet;
    }

}
