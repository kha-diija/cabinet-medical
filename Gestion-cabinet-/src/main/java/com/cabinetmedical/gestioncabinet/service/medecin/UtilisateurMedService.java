package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UtilisateurMedService {

    private final UtilisateurmedRepository utilisateurRepository;

    public Utilisateur findByLogin(String login) {
        return utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec login: " + login));
    }

    public Utilisateur findById(Integer id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + id));
    }

    public Utilisateur findById(Long id) {
        // Conversion Long à Integer
        Integer userId = id.intValue();
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + id));
    }
}