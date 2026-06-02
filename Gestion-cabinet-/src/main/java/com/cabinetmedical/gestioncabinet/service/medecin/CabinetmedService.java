package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.CabinetDTO;
import com.cabinetmedical.gestioncabinet.dto.medecin.CabinetStatsDTO;
import com.cabinetmedical.gestioncabinet.model.Cabinet;
import com.cabinetmedical.gestioncabinet.repository.medecin.CabinetmedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.PatientmedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CabinetmedService {

    private final CabinetmedRepository cabinetRepository;
    private final PatientmedRepository patientRepository;

    public List<CabinetDTO> getAllCabinets() {
        return cabinetRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CabinetDTO getCabinetById(Integer id) { // Changé Long en Integer
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        return convertToDTO(cabinet);
    }

    public CabinetDTO createCabinet(CabinetDTO cabinetDTO) {
        Cabinet cabinet = convertToEntity(cabinetDTO);
        Cabinet savedCabinet = cabinetRepository.save(cabinet);
        return convertToDTO(savedCabinet);
    }

    public CabinetDTO updateCabinet(Integer id, CabinetDTO cabinetDTO) { // Changé Long en Integer
        Cabinet existingCabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));

        existingCabinet.setNom(cabinetDTO.getNom());
        existingCabinet.setSpecialite(cabinetDTO.getSpecialite());
        existingCabinet.setAdresse(cabinetDTO.getAdresse());
        existingCabinet.setTel(cabinetDTO.getTel());
        existingCabinet.setActif(cabinetDTO.getActif());

        Cabinet updatedCabinet = cabinetRepository.save(existingCabinet);
        return convertToDTO(updatedCabinet);
    }

    public void deleteCabinet(Integer id) { // Changé Long en Integer
        cabinetRepository.deleteById(id);
    }

    public CabinetStatsDTO getCabinetStats(Integer id) { // Changé Long en Integer
        CabinetStatsDTO stats = new CabinetStatsDTO();

        // Vérifiez que cette méthode existe dans PatientRepository avec Integer
        Integer totalPatients = patientRepository.countByCabinetId(id);
        stats.setTotalPatients(totalPatients);

        return stats;
    }

    private CabinetDTO convertToDTO(Cabinet cabinet) {
        CabinetDTO dto = new CabinetDTO();
        dto.setId(cabinet.getId());
        dto.setNom(cabinet.getNom());
        dto.setSpecialite(cabinet.getSpecialite());
        dto.setAdresse(cabinet.getAdresse());
        dto.setTel(cabinet.getTel());
        dto.setActif(cabinet.getActif());
        dto.setDateCreation(cabinet.getDateCreation());
        return dto;
    }

    private Cabinet convertToEntity(CabinetDTO dto) {
        Cabinet cabinet = new Cabinet();
        cabinet.setNom(dto.getNom());
        cabinet.setSpecialite(dto.getSpecialite());
        cabinet.setAdresse(dto.getAdresse());
        cabinet.setTel(dto.getTel());
        cabinet.setActif(dto.getActif() != null ? dto.getActif() : true);
        return cabinet;
    }
}