package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.MedecinMessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.SecretaireDisponibleDTO;
import com.cabinetmedical.gestioncabinet.model.Messagerie;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.MessagerieRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.UtilisateurmedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedecinMessagerieServiceImpl implements MedecinMessagerieService {

    private final MessagerieRepository messagerieRepository;
    private final UtilisateurmedRepository utilisateurRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Récupérer un utilisateur par son ID
     */
    private Utilisateur getUtilisateurById(Integer userId) {
        return utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec ID: " + userId));
    }

    /**
     * Envoyer un message
     */
    @Override
    @Transactional
    public MedecinMessagerieDTO envoyerMessage(MedecinMessagerieDTO dto, MultipartFile file, Integer medecinId) {
        log.info("📤 [Service] Envoi message vers destinataire ID: {}", dto.getIdDestinataire());

        Utilisateur expediteur = getUtilisateurById(medecinId);

        // Vérifier que l'expéditeur est bien un médecin
        if (expediteur.getRole() != Utilisateur.Role.MEDECIN) {
            throw new RuntimeException("Seuls les médecins peuvent utiliser ce service");
        }

        Utilisateur destinataire = utilisateurRepository.findById(dto.getIdDestinataire())
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable"));

        // Créer le message
        Messagerie message = new Messagerie();
        message.setObjet(dto.getObjet());
        message.setContenu(dto.getContenu());
        message.setExpediteur(expediteur);
        message.setDestinataire(destinataire);
        message.setDateEnvoi(LocalDateTime.now());
        message.setLu(false);

        // Gestion du fichier
        if (file != null && !file.isEmpty()) {
            String fileName = saveFile(file);
            message.setPieceJointe(fileName);
            log.info("📎 Fichier joint: {}", fileName);
        }

        Messagerie saved = messagerieRepository.save(message);
        log.info("✅ Message envoyé - ID: {}", saved.getId());

        return toDTO(saved);
    }

    /**
     * Messages reçus (paginés)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<MedecinMessagerieDTO> getMessagesRecus(Pageable pageable, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);
        log.info("📥 [Service] Récupération messages reçus pour: {}", user.getLogin());

        Page<Messagerie> messages = messagerieRepository
                .findByDestinataireAndSupprimeDestinataireOrderByDateEnvoiDesc(user, false, pageable);

        return messages.map(this::toDTO);
    }

    /**
     * Messages envoyés (paginés)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<MedecinMessagerieDTO> getMessagesEnvoyes(Pageable pageable, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);
        log.info("📤 [Service] Récupération messages envoyés pour: {}", user.getLogin());

        Page<Messagerie> messages = messagerieRepository
                .findByExpediteurAndSupprimeExpediteurOrderByDateEnvoiDesc(user, false, pageable);

        return messages.map(this::toDTO);
    }

    /**
     * Message par ID
     */
    @Override
    @Transactional(readOnly = true)
    public MedecinMessagerieDTO getMessageById(Integer id, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);

        Messagerie message = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        // Vérifier que l'utilisateur a accès au message
        if (!message.getExpediteur().getId().equals(user.getId()) &&
                !message.getDestinataire().getId().equals(user.getId())) {
            throw new RuntimeException("Accès refusé à ce message");
        }

        return toDTO(message);
    }

    /**
     * Marquer comme lu
     */
    @Override
    @Transactional
    public MedecinMessagerieDTO marquerCommeLu(Integer id, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);

        Messagerie message = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        // Seul le destinataire peut marquer comme lu
        if (!message.getDestinataire().getId().equals(user.getId())) {
            throw new RuntimeException("Vous ne pouvez pas marquer ce message comme lu");
        }

        if (!message.getLu()) {
            message.setLu(true);
            message.setDateLecture(LocalDateTime.now());
            message = messagerieRepository.save(message);
            log.info("✅ Message {} marqué comme lu", id);
        }

        return toDTO(message);
    }

    /**
     * Compter messages non lus
     */
    @Override
    @Transactional(readOnly = true)
    public Long countMessagesNonLus(Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);
        Long count = messagerieRepository.countByDestinataireAndLu(user, false);
        log.info("📊 [Service] Messages non lus: {}", count);
        return count;
    }

    /**
     * Supprimer message (suppression logique)
     */
    @Override
    @Transactional
    public void supprimerMessage(Integer id, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);

        Messagerie message = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        // Suppression logique selon le rôle
        if (message.getExpediteur().getId().equals(user.getId())) {
            message.setSupprimeExpediteur(true);
        } else if (message.getDestinataire().getId().equals(user.getId())) {
            message.setSupprimeDestinataire(true);
        } else {
            throw new RuntimeException("Vous ne pouvez pas supprimer ce message");
        }

        messagerieRepository.save(message);
        log.info("🗑️ Message {} supprimé pour l'utilisateur {}", id, user.getLogin());
    }

    /**
     * Conversation avec un utilisateur
     */
    @Override
    @Transactional(readOnly = true)
    public List<MedecinMessagerieDTO> getConversation(Integer utilisateurId, Integer medecinId) {
        Utilisateur user = getUtilisateurById(medecinId);
        Utilisateur otherUser = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Messagerie> messages = messagerieRepository.findConversation(user, otherUser);

        return messages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Liste des secrétaires disponibles du même cabinet
     */
    @Override
    @Transactional(readOnly = true)
    public List<SecretaireDisponibleDTO> getSecretairesDisponibles(Integer medecinId) {
        Utilisateur medecin = getUtilisateurById(medecinId);

        if (medecin.getCabinet() == null) {
            log.warn("⚠️ Médecin {} n'a pas de cabinet associé", medecin.getLogin());
            return List.of();
        }

        List<Utilisateur> secretaires = utilisateurRepository
                .findByCabinetAndRoleAndActif(
                        medecin.getCabinet(),
                        Utilisateur.Role.SECRETAIRE,
                        true
                );

        return secretaires.stream()
                .map(this::toSecretaireDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sauvegarder un fichier uploadé
     */
    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir, "messages");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath);
            log.info("📁 Fichier sauvegardé: {}", fileName);

            return "messages/" + fileName;
        } catch (IOException e) {
            log.error("❌ Erreur sauvegarde fichier", e);
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier");
        }
    }

    /**
     * Conversion Messagerie → DTO
     */
    private MedecinMessagerieDTO toDTO(Messagerie message) {
        MedecinMessagerieDTO dto = new MedecinMessagerieDTO();
        dto.setId(message.getId());
        dto.setObjet(message.getObjet());
        dto.setContenu(message.getContenu());
        dto.setLu(message.getLu());
        dto.setDateEnvoi(message.getDateEnvoi());
        dto.setDateLecture(message.getDateLecture());
        dto.setPieceJointe(message.getPieceJointe());

        // Expéditeur
        dto.setIdExpediteur(message.getExpediteur().getId());
        dto.setNomExpediteur(message.getExpediteur().getNom());
        dto.setPrenomExpediteur(message.getExpediteur().getPrenom());
        dto.setRoleExpediteur(message.getExpediteur().getRole().name());

        // Destinataire
        dto.setIdDestinataire(message.getDestinataire().getId());
        dto.setNomDestinataire(message.getDestinataire().getNom());
        dto.setPrenomDestinataire(message.getDestinataire().getPrenom());
        dto.setRoleDestinataire(message.getDestinataire().getRole().name());

        return dto;
    }

    /**
     * Conversion Utilisateur → SecretaireDTO
     */
    private SecretaireDisponibleDTO toSecretaireDTO(Utilisateur secretaire) {
        SecretaireDisponibleDTO dto = new SecretaireDisponibleDTO();
        dto.setId(secretaire.getId());
        dto.setNom(secretaire.getNom());
        dto.setPrenom(secretaire.getPrenom());
        dto.setEmail(secretaire.getLogin());
        dto.setTelephone(secretaire.getNumTel());

        if (secretaire.getCabinet() != null) {
            dto.setCabinetId(secretaire.getCabinet().getId());
            dto.setCabinetNom(secretaire.getCabinet().getNom());
            dto.setCabinetAdresse(secretaire.getCabinet().getAdresse());
        }

        return dto;
    }
}