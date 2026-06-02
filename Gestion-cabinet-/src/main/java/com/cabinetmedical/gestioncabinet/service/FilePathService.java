package com.cabinetmedical.gestioncabinet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FilePathService {

    @Value("${file.base-url:http://localhost:8080}")
    private String baseUrl;

    public String getLogoUrl(String logoPath) {
        if (logoPath == null || logoPath.trim().isEmpty()) {
            return baseUrl + "/api/public/logo/default";
        }

        // Si le chemin est déjà une URL complète
        if (logoPath.startsWith("http")) {
            return logoPath;
        }

        // Si le chemin commence par "/uploads/"
        if (logoPath.startsWith("/uploads/")) {
            // Utiliser le contrôleur public
            return baseUrl + "/api/public/files" + logoPath;
        }

        // Si c'est juste un nom de fichier
        if (logoPath.contains("/")) {
            return baseUrl + "/api/public/files/" + logoPath;
        }

        // Par défaut, chercher dans logos
        return baseUrl + "/api/public/files/logos/" + logoPath;
    }

    public String normalizeLogoPath(String filename) {
        if (filename == null) return null;

        // Extraire juste le nom du fichier
        String name = filename;
        if (filename.contains("/")) {
            name = filename.substring(filename.lastIndexOf("/") + 1);
        }

        // S'assurer qu'il est dans le dossier logos
        return "logos/" + name;
    }
}