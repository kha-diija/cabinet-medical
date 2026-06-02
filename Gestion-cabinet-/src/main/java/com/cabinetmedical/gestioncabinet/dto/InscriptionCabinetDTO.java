package com.cabinetmedical.gestioncabinet.dto;

import lombok.Data;

@Data
public class InscriptionCabinetDTO {
    // Cabinet
    private String nomCabinet;
    private String specialite;
    private String adresseCabinet;
    private String telCabinet;
    private String emailCabinet;
    private String logoCabinet; // Chemin du fichier sauvegardé

    // Medecin
    private String nomMedecin;
    private String prenomMedecin;
    private String cinMedecin;
    private String telMedecin;
    private String emailMedecin;
    private String loginMedecin;
    private String pwdMedecin;
    private String signatureMedecin;

    // Secretaire
    private Boolean includeSecretaire;
    private String nomSecretaire;
    private String prenomSecretaire;
    private String cinSecretaire;
    private String telSecretaire;
    private String emailSecretaire;
    private String loginSecretaire;
    private String pwdSecretaire;

    // Documents (chemins)
    private String documentDiplome;
    private String documentCinMedecin;
    private String documentLicence;

    private Boolean acceptTerms;
}