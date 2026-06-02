package com.cabinetmedical.gestioncabinet.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessagerieDTO {

    private Integer id;

    @NotBlank(message = "L'objet est obligatoire")
    @Size(max = 200, message = "L'objet ne doit pas dépasser 200 caractères")
    private String objet;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    private Boolean lu;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateEnvoi;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateLecture;

    //@NotNull(message = "L'expéditeur est obligatoire")
    private Integer idExpediteur;

    @NotNull(message = "Le destinataire est obligatoire")
    private Integer idDestinataire;

    private String pieceJointe;

    // Informations enrichies
    private String nomExpediteur;
    private String prenomExpediteur;
    private String roleExpediteur;
    private String nomDestinataire;
    private String prenomDestinataire;
    private String roleDestinataire;
}