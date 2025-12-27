package com.pfa.api_gateway.Config ; // 👈 adapte EXACTEMENT au package de ton app

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(csrf -> csrf.disable())  // 🔹 pas de CSRF
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll() // 🔹 tout est autorisé au niveau gateway pour l’instant
                )
                .build();
    }
}
