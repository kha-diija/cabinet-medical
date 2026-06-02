package com.cabinetmedical.gestioncabinet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class SupabaseService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api.key}")
    private String supabaseApiKey;

    @Value("${supabase.storage.bucket}")
    private String storageBucket;

    /**
     * Télécharge un fichier depuis Supabase Storage
     * @param filePath Chemin du fichier (ex: "logos/1766840716791-img_png.png")
     * @return Contenu du fichier en bytes
     */
    public byte[] downloadFile(String filePath) throws Exception {
        System.out.println("🔍 [Supabase] Téléchargement: " + filePath);

        // Construire l'URL Supabase
        String urlString = supabaseUrl + "/storage/v1/object/" + storageBucket + "/" + filePath;
        System.out.println("🌐 [Supabase] URL: " + urlString);

        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        // ✅ Ajouter l'authentification
        connection.setRequestProperty("Authorization", "Bearer " + supabaseApiKey);
        connection.setRequestProperty("apikey", supabaseApiKey);

        connection.setConnectTimeout(10000);
        connection.setReadTimeout(10000);

        int responseCode = connection.getResponseCode();
        System.out.println("📡 [Supabase] Code réponse: " + responseCode);

        if (responseCode != 200) {
            String errorMessage = "Erreur Supabase: " + responseCode;
            System.err.println("❌ [Supabase] " + errorMessage);

            // Lire le message d'erreur
            try (InputStream errorStream = connection.getErrorStream()) {
                if (errorStream != null) {
                    String error = new String(errorStream.readAllBytes());
                    System.err.println("📄 [Supabase] Détails: " + error);
                }
            }

            throw new Exception(errorMessage);
        }

        // Lire les données
        InputStream inputStream = connection.getInputStream();
        byte[] fileData = inputStream.readAllBytes();
        inputStream.close();

        System.out.println("✅ [Supabase] Fichier téléchargé: " + fileData.length + " bytes");

        return fileData;
    }

    /**
     * Obtient le type de contenu d'un fichier
     */
    public String getContentType(String filePath) {
        String extension = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

        return switch (extension) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "svg" -> "image/svg+xml";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
    }
}