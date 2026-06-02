package com.cabinetmedical.gestioncabinet.service.admin;

import com.cabinetmedical.gestioncabinet.dto.admin.AdminFactureDTO;
import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.repository.admin.AdminFactureRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.math.BigDecimal;


@Service
public class AdminFactureService {

    private final AdminFactureRepository factureRepository;
    private final EmailService emailService;

    public AdminFactureService(AdminFactureRepository factureRepository, EmailService emailService) {
        this.factureRepository = factureRepository;
        this.emailService = emailService;
    }

    // Récupérer toutes les factures et les convertir en DTO
    public List<AdminFactureDTO> getAllFactures() {
        return factureRepository.findAll().stream()
                .map(f -> new AdminFactureDTO(
                        f.getIdFacture(),
                        f.getCabinet().getNom(),
                        f.getCabinet().getEmail(),
                        f.getMontant(),
                        f.getPeriode(),           // <-- ici
                        f.getDateCreation(),      // <-- correspond au LocalDateTime
                        f.getDatePaiement(),
                        f.getStatut()
                ))
                .collect(Collectors.toList());
    }

    // Récupérer factures par cabinet
    public List<AdminFactureDTO> getFacturesByCabinet(Cabinet cabinet) {
        return factureRepository.findByCabinet(cabinet).stream()
                .map(f -> new AdminFactureDTO(
                        f.getIdFacture(),
                        f.getCabinet().getNom(),
                        f.getCabinet().getEmail(),
                        f.getMontant(),
                        f.getPeriode(),
                        f.getDateCreation(),
                        f.getDatePaiement(),
                        f.getStatut()
                )).collect(Collectors.toList());
    }
    public AdminFacture updateFacture(Integer id, BigDecimal montant, String periode) {
        AdminFacture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));

        facture.setMontant(montant);
        facture.setPeriode(periode);

        return factureRepository.save(facture);
    }


    // Marquer une facture comme payée et envoyer notification
    public AdminFacture markAsPaid(Integer factureId) {
        AdminFacture facture = factureRepository.findById(factureId)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        facture.setStatut(AdminFacture.Statut.PAYEE);
        facture.setDatePaiement(LocalDate.now());

        // Sauvegarder la facture mise à jour
        AdminFacture saved = factureRepository.save(facture);

        // Envoyer email de notification
        emailService.sendFacturePaidNotification(facture.getCabinet().getEmail(), facture.getIdFacture());

        return saved;
    }

    // Filtrer les factures par période et statut
    public List<AdminFactureDTO> filterFactures(Cabinet cabinet, LocalDateTime start, LocalDateTime end, AdminFacture.Statut statut) {
        return factureRepository.findByCabinetAndDateCreationBetweenAndStatut(cabinet, start, end, statut)
                .stream()
                .map(f -> new AdminFactureDTO(
                        f.getIdFacture(),
                        f.getCabinet().getNom(),
                        f.getCabinet().getEmail(),
                        f.getMontant(),
                        f.getPeriode(),
                        f.getDateCreation(),
                        f.getDatePaiement(),
                        f.getStatut()
                ))
                .collect(Collectors.toList());
    }

    // Création automatique d'une facture lors de l'activation d'un cabinet
    public AdminFacture createFactureForCabinet(Cabinet cabinet) {
        AdminFacture facture = new AdminFacture();
        facture.setCabinet(cabinet);
        facture.setDateCreation(LocalDateTime.now()); // date automatique
        facture.setStatut(AdminFacture.Statut.EN_ATTENTE); // statut par défaut
        return factureRepository.save(facture);
    }
}
