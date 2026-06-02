package com.cabinetmedical.gestioncabinet.controller.admin;

import com.cabinetmedical.gestioncabinet.service.admin.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/documents")
@CrossOrigin(origins = "http://localhost:5173")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Télécharger un document (pour consultation par l'admin)
     * L'URL du document est passée en paramètre
     */
    @GetMapping("/view")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<?> viewDocument(@RequestParam String url) {
        try {
            System.out.println("📥 Téléchargement du document : " + url);

            byte[] fileContent = documentService.loadFile(url);

            // Déterminer le type MIME basé sur l'extension
            String contentType = determineContentType(url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(fileContent.length);
            headers.set("Content-Disposition", "inline"); // Pour affichage dans le navigateur

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du téléchargement : " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Impossible de charger le document");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Télécharger un document (pour téléchargement)
     */
    @GetMapping("/download")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<?> downloadDocument(@RequestParam String url) {
        try {
            System.out.println("💾 Téléchargement du document : " + url);

            byte[] fileContent = documentService.loadFile(url);
            String fileName = extractFileName(url);
            String contentType = determineContentType(url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(fileContent.length);
            headers.set("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors du téléchargement : " + e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Impossible de télécharger le document");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Déterminer le type MIME basé sur l'extension du fichier
     */
    private String determineContentType(String url) {
        String lowerUrl = url.toLowerCase();

        if (lowerUrl.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerUrl.endsWith(".png")) {
            return "image/png";
        } else if (lowerUrl.endsWith(".gif")) {
            return "image/gif";
        } else if (lowerUrl.endsWith(".doc") || lowerUrl.endsWith(".docx")) {
            return "application/msword";
        } else {
            return "application/octet-stream";
        }
    }

    /**
     * Extraire le nom du fichier depuis l'URL
     */
    private String extractFileName(String url) {
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash != -1 && lastSlash < url.length() - 1) {
            return url.substring(lastSlash + 1);
        }
        return "document";
    }
}