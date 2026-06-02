package com.cabinetmedical.gestioncabinet.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Document_Medical")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(length = 50)
    private String type;

    @Column(name = "chemin_fichier", nullable = false, length = 255)
    private String cheminFichier;

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier", nullable = false,
            foreignKey = @ForeignKey(name = "FK_DocumentMedical_Dossier"))
    private DossierMedical dossier;

    @PrePersist
    protected void onCreate() {
        dateAjout = LocalDateTime.now();
    }
}
