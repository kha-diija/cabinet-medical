package com.cabinetmedical.gestioncabinet.dto.admin;

import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// DTO pour AdminFacture, utilisé dans le controller pour l'affichage
public class AdminFactureDTO {

    private Integer id;                  // ID de la facture
    private String cabinetNom;           // Nom du cabinet
    private String cabinetEmail;         // Email du cabinet
    private BigDecimal montant;          // Montant de la facture
    private String periode;              // Période concernée (ex: "Janvier 2025")
    private LocalDateTime dateCreation;  // Date de création
    private LocalDate datePaiement;      // Date de paiement
    private AdminFacture.Statut statut;  // Statut de la facture

    // Constructeur vide pour Spring
    public AdminFactureDTO() {}

    // Constructeur complet
    public AdminFactureDTO(Integer id, String cabinetNom, String cabinetEmail, BigDecimal montant,
                           String periode, LocalDateTime dateCreation, LocalDate datePaiement,
                           AdminFacture.Statut statut) {
        this.id = id;
        this.cabinetNom = cabinetNom;
        this.cabinetEmail = cabinetEmail;
        this.montant = montant;
        this.periode = periode;
        this.dateCreation = dateCreation;
        this.datePaiement = datePaiement;
        this.statut = statut;
    }

    // Getters et Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCabinetNom() { return cabinetNom; }
    public void setCabinetNom(String cabinetNom) { this.cabinetNom = cabinetNom; }

    public String getCabinetEmail() { return cabinetEmail; }
    public void setCabinetEmail(String cabinetEmail) { this.cabinetEmail = cabinetEmail; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public String getPeriode() { return periode; }
    public void setPeriode(String periode) { this.periode = periode; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDate getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDate datePaiement) { this.datePaiement = datePaiement; }

    public AdminFacture.Statut getStatut() { return statut; }
    public void setStatut(AdminFacture.Statut statut) { this.statut = statut; }
}
