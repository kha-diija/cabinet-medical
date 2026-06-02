package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecretaireDisponibleDTO {
    private Integer id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    // Informations du cabinet
    private Integer cabinetId;
    private String cabinetNom;
    private String cabinetAdresse;
}