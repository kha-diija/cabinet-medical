package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicamentRepositoryAdmin extends JpaRepository<Medicament, Integer> {

    // Recherche par nom (pour autocomplétion)
    List<Medicament> findByNomContainingIgnoreCaseAndActifTrue(String nom);

    // Recherche par DCI
    List<Medicament> findByDciContainingIgnoreCaseAndActifTrue(String dci);

    // Recherche globale (nom, dci, laboratoire)
    @Query("SELECT m FROM Medicament m WHERE " +
            "(LOWER(m.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.dci) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.laboratoire) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND m.actif = true")
    List<Medicament> searchMedicaments(@Param("search") String search);

    // Récupérer tous les médicaments actifs
    List<Medicament> findByActifTrue();
}