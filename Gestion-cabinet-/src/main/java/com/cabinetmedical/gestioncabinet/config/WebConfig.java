package com.cabinetmedical.gestioncabinet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtenir le chemin absolu
        File uploadPath = new File(uploadDir);
        String absolutePath = uploadPath.getAbsolutePath();

        System.out.println("📁 Configuration uploads:");
        System.out.println("   → Chemin relatif: " + uploadDir);
        System.out.println("   → Chemin absolu: " + absolutePath);
        System.out.println("   → Existe: " + uploadPath.exists());

        // Servir les fichiers uploads avec chemin absolu
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/")
                .setCachePeriod(3600);

        // Logs pour debug
        System.out.println("✅ Handler configuré: /uploads/** → file:" + absolutePath + "/");
    }
}