package com.cabinetmedical.gestioncabinet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Historique_Actions", indexes = {
        @Index(name = "idx_utilisateur", columnList = "id_utilisateur"),
        @Index(name = "idx_date", columnList = "date_action")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueActions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String action;

    @Column(name = "table_concernee", length = 50)
    private String tableConcernee;

    @Column(name = "id_enregistrement")
    private Integer idEnregistrement;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false,
            foreignKey = @ForeignKey(name = "FK_HistoriqueActions_Utilisateur"))
    private Utilisateur utilisateur;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        dateAction = LocalDateTime.now();
    }
}
