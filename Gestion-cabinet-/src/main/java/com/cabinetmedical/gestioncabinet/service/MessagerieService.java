package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.MessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.MedecinDisponibleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MessagerieService {

    MessagerieDTO envoyerMessage(MessagerieDTO dto, MultipartFile file);

    Page<MessagerieDTO> getMessagesRecus(Pageable pageable);

    Page<MessagerieDTO> getMessagesEnvoyes(Pageable pageable);

    MessagerieDTO getMessageById(Integer id);

    MessagerieDTO marquerCommeLu(Integer id);

    Long countMessagesNonLus();

    void supprimerMessage(Integer id);

    List<MessagerieDTO> getConversation(Integer utilisateurId);

    List<MedecinDisponibleDTO> getMedecinsDisponibles();

}