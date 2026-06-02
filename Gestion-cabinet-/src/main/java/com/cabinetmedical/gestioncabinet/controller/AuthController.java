package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.LoginRequest;
import com.cabinetmedical.gestioncabinet.dto.LoginResponse;
import com.cabinetmedical.gestioncabinet.service.AuthService;
import com.cabinetmedical.gestioncabinet.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    /**
     * Endpoint de connexion
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Endpoint de vérification du token
     * GET /api/auth/verify
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        // Cette logique sera implémentée avec le filtre JWT
        return ResponseEntity.ok(new MessageResponse("Token valide"));
    }

    // Classes internes pour les réponses
    record ErrorResponse(String message) {}
    record MessageResponse(String message) {}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        passwordResetService.processForgotPassword(email);
        // On répond toujours OK pour la sécurité
        return ResponseEntity.ok(Map.of("message", "Si cet email existe, un lien a été envoyé."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur : " + e.getMessage()));
        }
    }
}