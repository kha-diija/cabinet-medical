package com.cabinetmedical.gestioncabinet.security.medecin;


import com.cabinetmedical.gestioncabinet.config.JwtService;
import com.cabinetmedical.gestioncabinet.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationMedFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Chemins publics
        String path = request.getServletPath();
        if (path.startsWith("/api/public") ||          // ✅ AJOUTER EN PREMIER
                path.startsWith("/api/auth") ||
                path.startsWith("/api/inscription") ||
                path.startsWith("/uploads") ||
                path.startsWith("/api/cabinets") ||
                path.startsWith("/h2-console")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extraire le token
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            // Extraire le username
            final String username = jwtService.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Charger l'utilisateur depuis la base de données
                var utilisateur = utilisateurRepository.findByLogin(username)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                // Créer UserPrincipal
                UserPrincipal userPrincipal = new UserPrincipal(utilisateur);

                // Valider le token
                if (jwtService.isTokenValid(token, userPrincipal)) {
                    // Créer l'authentification
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userPrincipal,
                                    null,
                                    userPrincipal.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Définir dans le contexte Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token invalide ou expiré");
        }
    }
}