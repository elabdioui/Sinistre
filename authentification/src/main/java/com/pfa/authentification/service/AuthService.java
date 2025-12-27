package com.pfa.authentification.service;

import com.pfa.authentification.dto.RegisterRequest;
import com.pfa.authentification.entity.Role;
import com.pfa.authentification.entity.User;
import com.pfa.authentification.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Inscription d'un nouvel utilisateur
     */
    @Transactional
    public User register(RegisterRequest request) {
        // Vérifier si le username existe déjà
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Le nom d'utilisateur existe déjà");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("L'email existe déjà");
        }

        // Valider le mot de passe
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères");
        }

        // Créer le nouvel utilisateur
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Définir le rôle (par défaut CLIENT, sauf si spécifié)
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.CLIENT);
            }
        } else {
            user.setRole(Role.CLIENT);
        }

        return userRepository.save(user);
    }

    /**
     * Authentification d'un utilisateur
     */
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nom d'utilisateur ou mot de passe incorrect"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Nom d'utilisateur ou mot de passe incorrect");
        }

        return user;
    }

    /**
     * Récupérer un utilisateur par son username
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Récupérer un utilisateur par son ID
     */
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    /**
     * Vérifier si un utilisateur existe par username
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Vérifier si un utilisateur existe par email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }


}