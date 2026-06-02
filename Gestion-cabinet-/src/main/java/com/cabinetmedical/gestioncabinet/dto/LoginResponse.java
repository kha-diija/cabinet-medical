
// LoginResponse.java
package com.cabinetmedical.gestioncabinet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private  String type = "Bearer";
    private Integer userId;
    private String login;
    private String nom;
    private String prenom;
    private String role;
    private Integer cabinetId;
    private String cabinetName;
}