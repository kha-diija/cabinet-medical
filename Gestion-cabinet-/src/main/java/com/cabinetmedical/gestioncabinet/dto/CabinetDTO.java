package com.cabinetmedical.gestioncabinet.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CabinetDTO {
    private Integer id;
    private String nom;
    private String specialite;
    private String adresse;
    private String tel;
    private Boolean actif;
}