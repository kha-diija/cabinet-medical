package com.cabinetmedical.gestioncabinet.dto.admin;

import java.time.LocalDateTime;

public class CabinetDTO {

    private Integer id;
    private String nom;
    private String email;
    private String specialite;
    private String adresse;
    private String tel;
    private String logo;
    private Boolean actif;
    private LocalDateTime dateCreation;

    public CabinetDTO() {}

    public CabinetDTO(Integer id, String nom, String email, String specialite, String adresse,
                      String tel, String logo, Boolean actif, LocalDateTime dateCreation) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.specialite = specialite;
        this.adresse = adresse;
        this.tel = tel;
        this.logo = logo;
        this.actif = actif;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}
