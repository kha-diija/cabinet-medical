package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.CabinetDTO;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.repository.admin.CabinetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cabinetmedical.gestioncabinet.service.CabinetsService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cabinets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CabinetsController {

    private final CabinetsService cabinetService;

    /**
     * GET /api/cabinets
     * Retourne la liste de tous les cabinets actifs
     */
    @Autowired
    private CabinetRepository cabinetRepository;

    @GetMapping
    public ResponseEntity<List<CabinetDTO>> getAllCabinets() {
        List<Cabinet> cabinets = cabinetRepository.findByActifTrue();

        // Convertir en DTO pour éviter les références circulaires
        List<CabinetDTO> cabinetDTOs = cabinets.stream()
                .map(cabinet -> new CabinetDTO(
                        cabinet.getId(),
                        cabinet.getNom(),
                        cabinet.getSpecialite(),
                        cabinet.getAdresse(),
                        cabinet.getTel(),
                        cabinet.getActif()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(cabinetDTOs);
    }

}