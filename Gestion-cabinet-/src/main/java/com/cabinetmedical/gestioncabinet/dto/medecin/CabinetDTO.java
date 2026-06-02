package com.cabinetmedical.gestioncabinet.dto.medecin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CabinetDTO {
    private Integer id;
    private String nom;
    private String specialite;
    private String adresse;
    private String tel;
    private Boolean actif;
    private LocalDateTime dateCreation;
}