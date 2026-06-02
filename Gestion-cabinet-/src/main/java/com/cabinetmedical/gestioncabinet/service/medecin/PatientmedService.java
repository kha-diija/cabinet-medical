package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.model.Patient;
import com.cabinetmedical.gestioncabinet.repository.medecin.PatientmedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientmedService {

    private final PatientmedRepository patientRepository;

    public List<Patient> searchPatientsByCabinet(String query, Integer cabinetId) {
        return patientRepository.searchByCabinet(query, cabinetId);
    }

    // AJOUTER cette méthode
    public List<Patient> getAllPatientsByCabinet(Integer cabinetId) {
        return patientRepository.findByCabinetIdOrderByNomAscPrenomAsc(cabinetId);
    }
}
