package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminFactureRepository extends JpaRepository<AdminFacture, Integer> {

    // Chercher toutes les factures par cabinet
    List<AdminFacture> findByCabinet(Cabinet cabinet);

    // Chercher toutes les factures par statut
    List<AdminFacture> findByStatut(AdminFacture.Statut statut);

    // Chercher les factures entre deux dates (dateCreation)
    List<AdminFacture> findByDateCreationBetween(LocalDateTime start, LocalDateTime end);

    // Chercher les factures d'un cabinet spécifique entre deux dates et par statut
    List<AdminFacture> findByCabinetAndDateCreationBetweenAndStatut(
            Cabinet cabinet, LocalDateTime start, LocalDateTime end, AdminFacture.Statut statut
    );
}
