package com.cabinetmedical.gestioncabinet.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    // 🔒 MAXIMUM 5 TENTATIVES
    private static final int MAX_ATTEMPT = 3;

    // Le cache stocke : LOGIN -> NOMBRE D'ECHECS
    private LoadingCache<String, Integer> attemptsCache;

    public LoginAttemptService() {
        super();
        attemptsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.MINUTES) // ⏳ Reset après 1 minute
                .build(new CacheLoader<String, Integer>() {
                    public Integer load(String key) {
                        return 0;
                    }
                });
    }

    // Appelé quand le login réussit
    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    // Appelé quand le login échoue
    public void loginFailed(String key) {
        int attempts = 0;
        try {
            attempts = attemptsCache.get(key);
        } catch (ExecutionException e) {
            attempts = 0;
        }
        attempts++;
        attemptsCache.put(key, attempts);
    }

    // Vérifie si l'utilisateur est bloqué
    public boolean isBlocked(String key) {
        try {
            return attemptsCache.get(key) >= MAX_ATTEMPT;
        } catch (ExecutionException e) {
            return false;
        }
    }
}