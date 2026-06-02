package com.cabinetmedical.gestioncabinet.repository;

import com.cabinetmedical.gestioncabinet.model.AlerteAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlerteAdminRepository extends JpaRepository<AlerteAdmin, Integer> {
    List<AlerteAdmin> findByLuFalseOrderByDateCreationDesc();
    List<AlerteAdmin> findByTypeAndLuFalseOrderByDateCreationDesc(AlerteAdmin.TypeAlerte type);
    Long countByLuFalse();
}