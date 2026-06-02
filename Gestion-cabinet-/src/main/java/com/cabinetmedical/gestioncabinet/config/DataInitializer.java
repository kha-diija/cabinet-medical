package com.cabinetmedical.gestioncabinet.config;
/*
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.model.Utilisateur;
import com.cabinetmedical.gestioncabinet.repository.CabinetRepository;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final CabinetRepository cabinetRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
       /* // 1️⃣ Créer plusieurs cabinets
        Cabinet cabinet1 = new Cabinet();
        cabinet1.setNom("Cabinet Rabat");
        cabinetRepository.save(cabinet1);

        Cabinet cabinet2 = new Cabinet();
        cabinet2.setNom("Cabinet Casablanca");
        cabinetRepository.save(cabinet2);

        Cabinet cabinet3 = new Cabinet();
        cabinet3.setNom("Cabinet Marrakech");
        cabinetRepository.save(cabinet3);

        // 2️⃣ Créer les utilisateurs avec BCrypt et rôles différents

        // ADMINISTRATEUR (pas de cabinet)
        if (!utilisateurRepository.existsByLogin("sabriomaima24@gmail.com")) {
            Utilisateur admin = new Utilisateur();
            admin.setLogin("sabriomaima24@gmail.com");
            admin.setPwd(passwordEncoder.encode("admin123"));
            admin.setNom("Sabri");
            admin.setPrenom("Omaima");
            admin.setRole(Utilisateur.Role.ADMINISTRATEUR);
            admin.setActif(true);
            utilisateurRepository.save(admin);
        }
/*
        // MEDECIN (lié au cabinet1)
        if (!utilisateurRepository.existsByLogin("med@gmail.com")) {
            Utilisateur medecin = new Utilisateur();
            medecin.setLogin("med@gmail.com");
            medecin.setPwd(passwordEncoder.encode("med123"));
            medecin.setNom("Dr.");
            medecin.setPrenom("Smith");
            medecin.setRole(Utilisateur.Role.MEDECIN);
            medecin.setCabinet(cabinet1);
            medecin.setActif(true);
            utilisateurRepository.save(medecin);
        }

        // SECRETAIRE (lié au cabinet1)
        if (!utilisateurRepository.existsByLogin("sec@gmail.com")) {
            Utilisateur secretaire = new Utilisateur();
            secretaire.setLogin("sec@gmail.com");
            secretaire.setPwd(passwordEncoder.encode("sec123"));
            secretaire.setNom("Mme");
            secretaire.setPrenom("Doe");
            secretaire.setRole(Utilisateur.Role.SECRETAIRE);
            secretaire.setCabinet(cabinet1);
            secretaire.setActif(true);
            utilisateurRepository.save(secretaire);
        }

        System.out.println("✅ Cabinets et utilisateurs créés avec BCrypt et rôles différents");
    }
 */