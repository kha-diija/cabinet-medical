package com.cabinetmedical.gestioncabinet.repository.admin;

import com.cabinetmedical.gestioncabinet.model.AdminFacture;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DashboardRepositoryAdmin extends JpaRepository<AdminFacture, Integer> {

    // 1️⃣ Statistiques globales
    @Query("SELECT COUNT(c) FROM Cabinet c")
    long countCabinets();

    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.actif = true")
    long countActiveUsers();

    @Query("SELECT COUNT(a) FROM AdminFacture a WHERE a.statut = 'EN_ATTENTE'")
    long countPendingAdminFactures();

    @Query("SELECT COALESCE(SUM(a.montant), 0) FROM AdminFacture a WHERE a.statut = 'PAYEE'")
    double totalRevenue();

    // 2️⃣ Résumé mensuel
    @Query("SELECT a FROM AdminFacture a WHERE a.dateCreation BETWEEN :start AND :end")
    List<AdminFacture> findAdminFacturesBetween(LocalDateTime start, LocalDateTime end);

    // 3️⃣ Dernières activités (utilisation de Pageable pour limiter)
    @Query("SELECT a FROM AdminFacture a WHERE a.statut = 'PAYEE' ORDER BY a.dateCreation DESC")
    List<AdminFacture> findLastAdminFactures(Pageable pageable);

    @Query("SELECT c FROM Cabinet c ORDER BY c.dateCreation DESC")
    List<Cabinet> findLastCabinets(Pageable pageable);

    @Query("SELECT u FROM Utilisateur u ORDER BY u.dateCreation DESC")
    List<Utilisateur> findLastUsers(Pageable pageable);
}
