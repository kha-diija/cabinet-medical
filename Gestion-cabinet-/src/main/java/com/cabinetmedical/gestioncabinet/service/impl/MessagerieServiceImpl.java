package com.cabinetmedical.gestioncabinet.service.impl;

import com.cabinetmedical.gestioncabinet.dto.MessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.MedecinDisponibleDTO;
import com.cabinetmedical.gestioncabinet.model.Messagerie;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.MessagerieRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import com.cabinetmedical.gestioncabinet.service.MessagerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagerieServiceImpl implements MessagerieService {

    private final MessagerieRepository messagerieRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * ✅ Récupère l'utilisateur courant ou retourne la secrétaire par défaut
     */
    private Utilisateur getCurrentUserOrDefault() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getName())) {

                String login = auth.getName();
                return utilisateurRepository.findByLogin(login)
                        .orElseGet(this::getDefaultSecretaire);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Authentification non disponible, utilisation de la secrétaire par défaut");
        }

        return getDefaultSecretaire();
    }

    /**
     * ✅ Retourne la secrétaire par défaut (f.bennani)
     */
    private Utilisateur getDefaultSecretaire() {
        return utilisateurRepository
                .findByLoginAndActif("f.bennani", true)
                .or(() -> utilisateurRepository.findFirstByRoleAndActif(Utilisateur.Role.SECRETAIRE, true))
                .orElseThrow(() -> new RuntimeException(
                        "❌ Aucune secrétaire active trouvée. Veuillez vérifier votre DataInitializer."
                ));
    }

    private MessagerieDTO convertToDTO(Messagerie m) {
        MessagerieDTO dto = new MessagerieDTO();
        dto.setId(m.getId());
        dto.setObjet(m.getObjet());
        dto.setContenu(m.getContenu());
        dto.setLu(m.getLu());
        dto.setDateEnvoi(m.getDateEnvoi());
        dto.setDateLecture(m.getDateLecture());
        dto.setPieceJointe(m.getPieceJointe());

        dto.setIdExpediteur(m.getExpediteur().getId());
        dto.setIdDestinataire(m.getDestinataire().getId());

        dto.setNomExpediteur(m.getExpediteur().getNom());
        dto.setPrenomExpediteur(m.getExpediteur().getPrenom());
        dto.setRoleExpediteur(m.getExpediteur().getRole().name());

        dto.setNomDestinataire(m.getDestinataire().getNom());
        dto.setPrenomDestinataire(m.getDestinataire().getPrenom());
        dto.setRoleDestinataire(m.getDestinataire().getRole().name());

        return dto;
    }

    private Messagerie convertToEntity(MessagerieDTO dto) {
        Messagerie m = new Messagerie();

        m.setId(dto.getId());
        m.setObjet(dto.getObjet());
        m.setContenu(dto.getContenu());
        m.setLu(dto.getLu() != null ? dto.getLu() : false);
        m.setPieceJointe(dto.getPieceJointe());

        Utilisateur expediteur = utilisateurRepository.findById(dto.getIdExpediteur())
                .orElseThrow(() -> new RuntimeException("Expéditeur introuvable"));

        Utilisateur destinataire = utilisateurRepository.findById(dto.getIdDestinataire())
                .orElseThrow(() -> new RuntimeException("Destinataire introuvable"));

        m.setExpediteur(expediteur);
        m.setDestinataire(destinataire);

        return m;
    }

    // ✅ REMPLACER la méthode envoyerMessage() dans MessagerieServiceImpl.java

    @Override
    @Transactional
    public MessagerieDTO envoyerMessage(MessagerieDTO dto, MultipartFile file) {
        // Force l'expéditeur
        Utilisateur expediteur = getCurrentUserOrDefault();
        dto.setIdExpediteur(expediteur.getId());

        Messagerie message = convertToEntity(dto);

        // ✅ Gestion du fichier avec chemin ABSOLU
        if (file != null && !file.isEmpty()) {
            try {
                // ✅ Utiliser un chemin absolu dans le répertoire utilisateur
                String userHome = System.getProperty("user.home");
                String uploadDir = userHome + File.separator + "cabinet-medical-uploads" +
                        File.separator + "messages" + File.separator;

                // Créer tous les dossiers nécessaires
                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    boolean created = directory.mkdirs();
                    System.out.println("📁 Dossier créé: " + uploadDir + " - " + created);
                }

                // Générer un nom de fichier unique
                String originalFilename = file.getOriginalFilename();
                String extension = "";

                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }

                String fileName = System.currentTimeMillis() + "_" +
                        UUID.randomUUID().toString().substring(0, 8) + extension;
                String filePath = uploadDir + fileName;

                // Sauvegarder le fichier
                File dest = new File(filePath);
                file.transferTo(dest);

                // ✅ Stocker le chemin relatif en BDD (plus portable)
                message.setPieceJointe("messages/" + fileName);

                System.out.println("✅ Fichier uploadé: " + filePath);
                System.out.println("✅ Taille: " + file.getSize() + " bytes");

            } catch (IOException e) {
                System.err.println("❌ Erreur upload: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Erreur lors de l'upload du fichier: " + e.getMessage(), e);
            }
        }

        Messagerie saved = messagerieRepository.save(message);
        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessagerieDTO> getMessagesRecus(Pageable pageable) {
        Utilisateur user = getCurrentUserOrDefault();
        return messagerieRepository
                .findByDestinataireAndSupprimeDestinataireOrderByDateEnvoiDesc(user, false, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessagerieDTO> getMessagesEnvoyes(Pageable pageable) {
        Utilisateur user = getCurrentUserOrDefault();
        return messagerieRepository
                .findByExpediteurAndSupprimeExpediteurOrderByDateEnvoiDesc(user, false, pageable)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public MessagerieDTO getMessageById(Integer id) {
        Messagerie m = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        return convertToDTO(m);
    }

    @Override
    @Transactional
    public MessagerieDTO marquerCommeLu(Integer id) {
        Messagerie m = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        m.setLu(true);
        messagerieRepository.save(m);

        return convertToDTO(m);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countMessagesNonLus() {
        Utilisateur user = getCurrentUserOrDefault();
        return messagerieRepository.countByDestinataireAndLu(user, false);
    }

    @Override
    @Transactional
    public void supprimerMessage(Integer id) {
        Utilisateur user = getCurrentUserOrDefault();
        Messagerie m = messagerieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        if (m.getExpediteur().equals(user)) {
            m.setSupprimeExpediteur(true);
        } else if (m.getDestinataire().equals(user)) {
            m.setSupprimeDestinataire(true);
        }

        messagerieRepository.save(m);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessagerieDTO> getConversation(Integer utilisateurId) {
        Utilisateur user1 = getCurrentUserOrDefault();
        Utilisateur user2 = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return messagerieRepository.findConversation(user1, user2)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedecinDisponibleDTO> getMedecinsDisponibles() {
        Utilisateur user = getCurrentUserOrDefault();

        List<Utilisateur> medecins;

        if (user.getCabinet() != null) {
            medecins = utilisateurRepository
                    .findByRoleAndCabinetAndActif(Utilisateur.Role.MEDECIN, user.getCabinet(), true);
        } else {
            medecins = utilisateurRepository
                    .findByRoleAndActif(Utilisateur.Role.MEDECIN, true);
        }

        return medecins.stream()
                .map(m -> {
                    MedecinDisponibleDTO dto = new MedecinDisponibleDTO();
                    dto.setId(m.getId());
                    dto.setNom(m.getNom());
                    dto.setPrenom(m.getPrenom());

                    if (m.getCabinet() != null) {
                        dto.setCabinetId(m.getCabinet().getId());
                        dto.setCabinetNom(m.getCabinet().getNom());
                        dto.setCabinetAdresse(m.getCabinet().getAdresse());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }
}