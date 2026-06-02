package com.cabinetmedical.gestioncabinet.repository.medecin;

import com.cabinetmedical.gestioncabinet.model.OrdonnanceExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OrdonnanceExamenRepository extends JpaRepository<OrdonnanceExamen, Integer> {

    /**
     * Récupérer tous les examens d'une ordonnance
     */
    @Query("""
        SELECT oe
        FROM OrdonnanceExamen oe
        WHERE oe.ordonnance.id = :ordonnanceId
        ORDER BY oe.id
    """)
    List<OrdonnanceExamen> findByOrdonnanceId(@Param("ordonnanceId") Integer ordonnanceId);

    /**
     * Supprimer tous les examens d'une ordonnance
     */
    @Modifying
    @Transactional
    @Query("""
        DELETE FROM OrdonnanceExamen oe
        WHERE oe.ordonnance.id = :ordonnanceId
    """)
    void deleteByOrdonnanceId(@Param("ordonnanceId") Integer ordonnanceId);
}