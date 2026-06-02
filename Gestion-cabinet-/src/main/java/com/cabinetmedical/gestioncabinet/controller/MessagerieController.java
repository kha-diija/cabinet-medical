package com.cabinetmedical.gestioncabinet.controller;

import com.cabinetmedical.gestioncabinet.dto.MessagerieDTO;
import com.cabinetmedical.gestioncabinet.dto.MedecinDisponibleDTO;
import com.cabinetmedical.gestioncabinet.service.MessagerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/messagerie")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessagerieController {

    private final MessagerieService messagerieService;

    /**
     * ✅ Envoyer un message - l'expéditeur est déterminé automatiquement par le service
     */
    @PostMapping
    public ResponseEntity<MessagerieDTO> envoyerMessage(@RequestBody MessagerieDTO dto) {
        // ✅ Le service se charge de déterminer l'expéditeur (user connecté ou secrétaire par défaut)
        MessagerieDTO saved = messagerieService.envoyerMessage(dto, null);
        return ResponseEntity.ok(saved);
    }

    /**
     * ✅ Envoyer un message avec pièce jointe
     */
    @PostMapping("/avec-fichier")
    public ResponseEntity<MessagerieDTO> envoyerMessageAvecFichier(
            @RequestPart("message") MessagerieDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        MessagerieDTO saved = messagerieService.envoyerMessage(dto, file);
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/recus")
    public ResponseEntity<Page<MessagerieDTO>> getMessagesRecus(Pageable pageable) {
        Page<MessagerieDTO> messages = messagerieService.getMessagesRecus(pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/envoyes")
    public ResponseEntity<Page<MessagerieDTO>> getMessagesEnvoyes(Pageable pageable) {
        Page<MessagerieDTO> messages = messagerieService.getMessagesEnvoyes(pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessagerieDTO> getMessageById(@PathVariable Integer id) {
        MessagerieDTO message = messagerieService.getMessageById(id);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/{id}/marquer-lu")
    public ResponseEntity<MessagerieDTO> marquerCommeLu(@PathVariable Integer id) {
        MessagerieDTO message = messagerieService.marquerCommeLu(id);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/non-lus/count")
    public ResponseEntity<Long> countMessagesNonLus() {
        Long count = messagerieService.countMessagesNonLus();
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Integer id) {
        messagerieService.supprimerMessage(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conversation/{utilisateurId}")
    public ResponseEntity<List<MessagerieDTO>> getConversation(@PathVariable Integer utilisateurId) {
        List<MessagerieDTO> messages = messagerieService.getConversation(utilisateurId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinDisponibleDTO>> getMedecinsDisponibles() {
        List<MedecinDisponibleDTO> medecins = messagerieService.getMedecinsDisponibles();
        return ResponseEntity.ok(medecins);
    }
}