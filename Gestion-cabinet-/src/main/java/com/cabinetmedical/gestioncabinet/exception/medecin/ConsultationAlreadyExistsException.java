package com.cabinetmedical.gestioncabinet.exception.medecin;

public class ConsultationAlreadyExistsException extends RuntimeException {
    public ConsultationAlreadyExistsException(String message) {
        super(message);
    }
}