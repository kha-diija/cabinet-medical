package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;

@Data
public class CabinetInfoDTO {
    private Integer id;
    private String nom;
    private String specialite; // Spécialité du cabinet
    private String adresse;
    private String tel;
    private String logo;
    private String medecinNom;
    // Supprimez medecinSpecialite si elle n'existe pas dans Utilisateur
}