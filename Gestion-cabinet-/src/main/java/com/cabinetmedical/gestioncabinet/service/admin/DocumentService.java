package com.cabinetmedical.gestioncabinet.service.admin;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentService {

    private final SupabaseStorageService supabaseStorageService;

    public DocumentService(SupabaseStorageService supabaseStorageService) {
        this.supabaseStorageService = supabaseStorageService;
    }

    /**
     * Sauvegarder une licence
     */
    public String saveLicence(MultipartFile file) throws IOException {
        System.out.println("📄 Upload licence : " + file.getOriginalFilename());
        return supabaseStorageService.uploadFile(file, "licences");
    }

    /**
     * Sauvegarder un diplôme
     */
    public String saveDiplome(MultipartFile file) throws IOException {
        System.out.println("🎓 Upload diplôme : " + file.getOriginalFilename());
        return supabaseStorageService.uploadFile(file, "diplomes");
    }

    /**
     * Sauvegarder une CIN
     */
    public String saveCinMedecin(MultipartFile file) throws IOException {
        System.out.println("🪪 Upload CIN médecin : " + file.getOriginalFilename());
        return supabaseStorageService.uploadFile(file, "cin_medecins");
    }

    /**
     * Sauvegarder un logo de cabinet
     */
    public String saveLogo(MultipartFile file) throws IOException {
        System.out.println("🏥 Upload logo cabinet : " + file.getOriginalFilename());
        return supabaseStorageService.uploadFile(file, "logos");
    }

    /**
     * Sauvegarder une signature
     */
    public String saveSignature(MultipartFile file) throws IOException {
        System.out.println("✍️ Upload signature : " + file.getOriginalFilename());
        return supabaseStorageService.uploadFile(file, "signatures");
    }

    /**
     * Récupérer un document par son URL
     */
    public byte[] loadFile(String fileUrl) throws IOException {
        String filePath = supabaseStorageService.extractFilePathFromUrl(fileUrl);
        return supabaseStorageService.downloadFile(filePath);
    }

    /**
     * Supprimer un document
     */
    public void deleteFile(String fileUrl) throws IOException {
        String filePath = supabaseStorageService.extractFilePathFromUrl(fileUrl);
        supabaseStorageService.deleteFile(filePath);
    }

    /**
     * Obtenir l'URL publique d'un document
     */
    public String getPublicUrl(String filePath) {
        return supabaseStorageService.getPublicUrl(filePath);
    }
}