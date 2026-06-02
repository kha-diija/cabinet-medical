package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.RendezVousDTO;
import com.cabinetmedical.gestioncabinet.exception.ResourceNotFoundException;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public RendezVousDTO createRendezVous(RendezVousDTO dto) {
        Patient patient = patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        Utilisateur medecin = utilisateurRepository.findById(dto.getIdMedecin())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        if (medecin.getRole() != Utilisateur.Role.MEDECIN) {
            throw new IllegalArgumentException("L'utilisateur n'est pas un médecin");
        }

        // Vérifier disponibilité
        boolean existe = rendezVousRepository.existsByMedecinAndDateRdvAndHeureRdvAndStatutNot(
                medecin, dto.getDateRdv(), dto.getHeureRdv(), RendezVous.Statut.ANNULE);

        if (existe) {
            throw new IllegalStateException("Ce créneau est déjà occupé");
        }

        RendezVous rendezVous = new RendezVous();
        rendezVous.setPatient(patient);
        rendezVous.setMedecin(medecin);
        rendezVous.setDateRdv(dto.getDateRdv());
        rendezVous.setHeureRdv(dto.getHeureRdv());
        rendezVous.setMotif(RendezVous.Motif.valueOf(dto.getMotif()));
        rendezVous.setStatut(RendezVous.Statut.EN_ATTENTE);
        rendezVous.setNotes(dto.getNotes());

        RendezVous saved = rendezVousRepository.save(rendezVous);

        // ✅ CORRECTION : Utiliser 'saved' au lieu de 'rdv'
        notificationService.creerNotificationAutomatique(
                medecin,
                Notification.Type.RAPPEL_RDV,
                "Nouveau rendez-vous avec " + saved.getPatient().getNom() + " " + saved.getPatient().getPrenom(),
                saved
        );

        return mapToDTO(saved);
    }

    public RendezVousDTO updateRendezVous(Integer id, RendezVousDTO dto) {
        RendezVous rendezVous = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));

        // Si changement de créneau, vérifier disponibilité
        if (!rendezVous.getDateRdv().equals(dto.getDateRdv()) ||
                !rendezVous.getHeureRdv().equals(dto.getHeureRdv())) {

            boolean existe = rendezVousRepository.existsByMedecinAndDateRdvAndHeureRdvAndStatutNot(
                    rendezVous.getMedecin(), dto.getDateRdv(), dto.getHeureRdv(), RendezVous.Statut.ANNULE);

            if (existe) {
                throw new IllegalStateException("Ce créneau est déjà occupé");
            }
        }

        rendezVous.setDateRdv(dto.getDateRdv());
        rendezVous.setHeureRdv(dto.getHeureRdv());
        rendezVous.setMotif(RendezVous.Motif.valueOf(dto.getMotif()));
        rendezVous.setNotes(dto.getNotes());

        if (dto.getStatut() != null) {
            rendezVous.setStatut(RendezVous.Statut.valueOf(dto.getStatut()));
        }

        RendezVous updated = rendezVousRepository.save(rendezVous);
        return mapToDTO(updated);
    }

    public void cancelRendezVous(Integer id) {
        RendezVous rendezVous = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));

        rendezVous.setStatut(RendezVous.Statut.ANNULE);
        rendezVousRepository.save(rendezVous);
    }

    public RendezVousDTO updateStatut(Integer id, String statut) {
        RendezVous rendezVous = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));

        rendezVous.setStatut(RendezVous.Statut.valueOf(statut));
        RendezVous updated = rendezVousRepository.save(rendezVous);

        return mapToDTO(updated);
    }

    public RendezVousDTO getRendezVousById(Integer id) {
        RendezVous rendezVous = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));
        return mapToDTO(rendezVous);
    }

    public Page<RendezVousDTO> getAllRendezVous(Pageable pageable) {
        return rendezVousRepository.findAll(pageable).map(this::mapToDTO);
    }

    public List<RendezVousDTO> getRendezVousByDate(LocalDate date) {
        return rendezVousRepository.findByDateRdv(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<RendezVousDTO> getRendezVousByMedecinAndDate(Integer medecinId, LocalDate date) {
        Utilisateur medecin = utilisateurRepository.findById(medecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        return rendezVousRepository.findByMedecinAndDateRdv(medecin, date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<RendezVousDTO> getRendezVousByPatient(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        return rendezVousRepository.findByPatient(patient).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<String> getCreneauxDisponibles(Integer medecinId, LocalDate date) {
        Utilisateur medecin = utilisateurRepository.findById(medecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        List<RendezVous> rdvExistants = rendezVousRepository.findActiveRendezVousByMedecinAndDate(medecin, date);

        // Créneaux de 8h à 18h, chaque 30 minutes
        List<String> tousCreneaux = new ArrayList<>();
        LocalTime debut = LocalTime.of(8, 0);
        LocalTime fin = LocalTime.of(18, 0);

        while (debut.isBefore(fin)) {
            tousCreneaux.add(debut.toString());
            debut = debut.plusMinutes(30);
        }

        // Retirer les créneaux occupés
        List<String> creneauxOccupes = rdvExistants.stream()
                .map(rdv -> rdv.getHeureRdv().toString())
                .collect(Collectors.toList());

        tousCreneaux.removeAll(creneauxOccupes);

        return tousCreneaux;
    }

    private RendezVousDTO mapToDTO(RendezVous rdv) {
        RendezVousDTO dto = new RendezVousDTO();
        dto.setIdRendezVous(rdv.getIdRendezVous());
        dto.setDateRdv(rdv.getDateRdv());
        dto.setHeureRdv(rdv.getHeureRdv());
        dto.setMotif(rdv.getMotif().name());
        dto.setStatut(rdv.getStatut().name());
        dto.setNotes(rdv.getNotes());
        dto.setIdPatient(rdv.getPatient().getId());
        dto.setIdMedecin(rdv.getMedecin().getId());
        dto.setDateCreation(rdv.getDateCreation());

        // Informations enrichies
        dto.setNomPatient(rdv.getPatient().getNom());
        dto.setPrenomPatient(rdv.getPatient().getPrenom());
        dto.setCinPatient(rdv.getPatient().getCin());
        dto.setNomMedecin(rdv.getMedecin().getNom());
        dto.setPrenomMedecin(rdv.getMedecin().getPrenom());
        dto.setHasConsultation(rdv.getConsultation() != null);

        return dto;
    }
}