package com.cabinetmedical.gestioncabinet.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Gestion Cabinet Médical");
        response.put("version", "1.0.0");
        response.put("status", "RUNNING");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "✅ API opérationnelle");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Dashboard Stats", "GET /api/secretaire/dashboard/stats");
        endpoints.put("Patients", "GET /api/secretaire/patients");
        endpoints.put("Rendez-vous du jour", "GET /api/secretaire/rendez-vous/jour?date=YYYY-MM-DD");
        endpoints.put("Health Check", "GET /api/health");
        endpoints.put("H2 Console", "GET /h2-console");

        response.put("available_endpoints", endpoints);
        return response;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Gestion Cabinet Médical");
        return response;
    }
}