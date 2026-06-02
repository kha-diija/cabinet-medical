package com.cabinetmedical.gestioncabinet.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Contrôleur pour servir les fichiers uploadés (audio, documents, etc.)
 */
@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
public class FileStorageController {

    private final String uploadBaseDir = System.getProperty("user.home") +
            File.separator + "cabinet-medical-uploads" +
            File.separator;

    /**
     * Servir un fichier uploadé
     * URL: GET /uploads/messages/audio_123456.webm
     */
    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(@RequestParam(required = false) String path) {
        try {
            // Récupérer le chemin du fichier depuis l'URL
            String requestURI = ((org.springframework.web.context.request.ServletRequestAttributes)
                    org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                    .getRequest().getRequestURI();

            String filePath = requestURI.replace("/uploads/", "");

            // Construire le chemin complet
            Path fullPath = Paths.get(uploadBaseDir, filePath);
            File file = fullPath.toFile();

            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }

            // Déterminer le type MIME
            String contentType = determineContentType(file.getName());

            Resource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("❌ Erreur lecture fichier: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Détermine le type MIME basé sur l'extension du fichier
     */
    private String determineContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        return switch (extension) {
            case "webm" -> "audio/webm";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            default -> "application/octet-stream";
        };
    }
}