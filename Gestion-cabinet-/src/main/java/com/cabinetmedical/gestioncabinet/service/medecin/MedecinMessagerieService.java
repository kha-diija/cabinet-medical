package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MedecinMessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.SecretaireDisponibleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MedecinMessagerieService {

    /**
     * Envoyer un message avec ou sans pièce jointe
     */
    MedecinMessagerieDTO envoyerMessage(MedecinMessagerieDTO dto, MultipartFile file, Integer medecinId);

    /**
     * Récupérer les messages reçus (paginés)
     */
    Page<MedecinMessagerieDTO> getMessagesRecus(Pageable pageable, Integer medecinId);

    /**
     * Récupérer les messages envoyés (paginés)
     */
    Page<MedecinMessagerieDTO> getMessagesEnvoyes(Pageable pageable, Integer medecinId);

    /**
     * Récupérer un message par son ID
     */
    MedecinMessagerieDTO getMessageById(Integer id, Integer medecinId);

    /**
     * Marquer un message comme lu
     */
    MedecinMessagerieDTO marquerCommeLu(Integer id, Integer medecinId);

    /**
     * Compter les messages non lus
     */
    Long countMessagesNonLus(Integer medecinId);

    /**
     * Supprimer un message (suppression logique)
     */
    void supprimerMessage(Integer id, Integer medecinId);

    /**
     * Récupérer la conversation avec un utilisateur
     */
    List<MedecinMessagerieDTO> getConversation(Integer utilisateurId, Integer medecinId);

    /**
     * Récupérer la liste des secrétaires disponibles
     */
    List<SecretaireDisponibleDTO> getSecretairesDisponibles(Integer medecinId);
}