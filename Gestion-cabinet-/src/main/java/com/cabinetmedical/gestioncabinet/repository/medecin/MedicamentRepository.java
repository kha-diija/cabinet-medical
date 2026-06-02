package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicamentRepository extends JpaRepository<Medicament, Integer> {

    /**
     * Rechercher des médicaments par nom ou DCI
     * Retourne maximum 20 résultats
     */
    @Query("""
        SELECT m
        FROM Medicament m
        WHERE m.actif = true
          AND (LOWER(m.nom) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(m.dci) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY m.nom
    """)
    List<Medicament> searchByName(@Param("query") String query);

    /**
     * Récupérer tous les médicaments actifs
     */
    @Query("""
        SELECT m
        FROM Medicament m
        WHERE m.actif = true
        ORDER BY m.nom
    """)
    List<Medicament> findAllActive();

    /**
     * Récupérer les médicaments par laboratoire
     */
    @Query("""
        SELECT m
        FROM Medicament m
        WHERE m.actif = true
          AND LOWER(m.laboratoire) = LOWER(:laboratoire)
        ORDER BY m.nom
    """)
    List<Medicament> findByLaboratoire(@Param("laboratoire") String laboratoire);
}