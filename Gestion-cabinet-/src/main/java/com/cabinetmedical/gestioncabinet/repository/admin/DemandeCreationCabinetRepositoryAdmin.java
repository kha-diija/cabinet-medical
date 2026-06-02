package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.DemandeCreationCabinet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeCreationCabinetRepositoryAdmin
        extends JpaRepository<DemandeCreationCabinet, Integer> {

    List<DemandeCreationCabinet>
    findByStatut(DemandeCreationCabinet.Statut statut);
}
