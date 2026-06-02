package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.repository.CabinetsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CabinetsService {

    private final CabinetsRepository cabinetRepository;

    // Une seule méthode suffit. Elle renvoie TOUT (actifs et inactifs)
    public List<Cabinet> getAllCabinets() {
        return cabinetRepository.findAll();
    }
}