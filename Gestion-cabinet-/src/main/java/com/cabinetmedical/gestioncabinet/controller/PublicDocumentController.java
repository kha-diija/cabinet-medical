package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.service.SupabaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PublicDocumentController {

    private final SupabaseService supabaseService;

    @GetMapping("/logos/{filename}")
    public ResponseEntity<Resource> getLogo(@PathVariable String filename) {
        try {
            System.out.println("🖼️  [Public] Requête logo: " + filename);

            // ✅ Construire le chemin (enlever "logos/" s'il est déjà présent)
            String supabasePath = filename.startsWith("logos/") ? filename : "logos/" + filename;
            System.out.println("📁 [Public] Chemin Supabase: " + supabasePath);

            byte[] fileData = supabaseService.downloadFile(supabasePath);


            // ✅ Déterminer le type de contenu
            String contentType = supabaseService.getContentType(filename);

            System.out.println("✅ [Public] Logo téléchargé avec succès");
            System.out.println("📦 [Public] Taille: " + fileData.length + " bytes");
            System.out.println("📄 [Public] Type: " + contentType);
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            ByteArrayResource resource = new ByteArrayResource(fileData);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .contentLength(fileData.length)
                    .body(resource);

        } catch (Exception e) {
            System.err.println("❌ [Public] ERREUR: " + e.getMessage());
            e.printStackTrace();
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}