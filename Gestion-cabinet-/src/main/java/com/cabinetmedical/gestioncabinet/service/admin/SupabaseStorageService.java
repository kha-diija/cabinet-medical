package com.cabinetmedical.gestioncabinet.service.admin;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api.key}")
    private String supabaseApiKey;

    @Value("${supabase.storage.bucket}")
    private String bucketName;

    private final OkHttpClient client = new OkHttpClient();

    /**
     * Upload un fichier vers Supabase Storage
     * @param file Le fichier à uploader
     * @param folder Le dossier de destination (ex: "licences", "diplomes", "cin")
     * @return L'URL publique du fichier uploadé
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }

        // Générer un nom unique pour le fichier
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String fileName = String.format("%s/%s_%s%s", folder, timestamp, uniqueId, extension);

        // Construire l'URL d'upload
        String url = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, fileName);

        // Créer la requête avec le fichier
        RequestBody requestBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse(file.getContentType())
        );

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + supabaseApiKey)
                .addHeader("Content-Type", file.getContentType())
                .post(requestBody)
                .build();

        // Exécuter la requête
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                throw new IOException("Échec de l'upload : " + response.code() + " - " + errorBody);
            }

            // Retourner l'URL publique du fichier
            return getPublicUrl(fileName);
        }
    }

    /**
     * Obtenir l'URL publique d'un fichier
     * @param filePath Le chemin du fichier dans le bucket
     * @return L'URL publique
     */
    public String getPublicUrl(String filePath) {
        return String.format("%s/storage/v1/object/public/%s/%s",
                supabaseUrl, bucketName, filePath);
    }

    /**
     * Supprimer un fichier de Supabase Storage
     * @param filePath Le chemin du fichier à supprimer
     */
    public void deleteFile(String filePath) throws IOException {
        String url = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, filePath);

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + supabaseApiKey)
                .delete()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error details";
                System.err.println("⚠️ Échec de la suppression : " + errorBody);
            }
        }
    }

    /**
     * Télécharger un fichier depuis Supabase Storage
     * @param filePath Le chemin du fichier
     * @return Les bytes du fichier
     */
    public byte[] downloadFile(String filePath) throws IOException {
        String url = String.format("%s/storage/v1/object/%s/%s",
                supabaseUrl, bucketName, filePath);

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + supabaseApiKey)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Échec du téléchargement : " + response.code());
            }

            return response.body() != null ? response.body().bytes() : new byte[0];
        }
    }

    /**
     * Extraire le chemin du fichier depuis une URL complète
     * @param fullUrl L'URL complète du fichier
     * @return Le chemin relatif du fichier
     */
    public String extractFilePathFromUrl(String fullUrl) {
        if (fullUrl == null || fullUrl.isEmpty()) {
            return null;
        }

        String pattern = String.format("/storage/v1/object/public/%s/", bucketName);
        int index = fullUrl.indexOf(pattern);

        if (index != -1) {
            return fullUrl.substring(index + pattern.length());
        }

        return fullUrl;
    }
}