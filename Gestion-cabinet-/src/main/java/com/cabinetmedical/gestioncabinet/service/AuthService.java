package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.dto.LoginRequest;
import com.cabinetmedical.gestioncabinet.dto.LoginResponse;
import com.cabinetmedical.gestioncabinet.dto.RegisterRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
}