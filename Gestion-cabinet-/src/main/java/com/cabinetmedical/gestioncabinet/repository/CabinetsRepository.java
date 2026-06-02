package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.Cabinet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface CabinetsRepository extends JpaRepository<Cabinet, Integer> {

    Optional<Cabinet> findByNom(String nom);

    boolean existsByNom(String nom);
    List<Cabinet> findByActifTrue();
    boolean existsByIdAndActifTrue(Integer id);
}