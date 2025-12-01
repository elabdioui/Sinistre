package Config;

import jakarta.ws.rs.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // 1. Désactiver CSRF (inutile pour les API REST stateless)
                .csrf(csrf -> csrf.disable())

                // 2. Configurer CORS directement dans la chaîne de sécurité
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Autoriser les accès
                .authorizeExchange(exchanges -> exchanges
                        // IMPORTANT : Autoriser toutes les requêtes OPTIONS (Preflight)
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        // Autoriser l'authentification sans token
                        .pathMatchers("/auth/**").permitAll()
                        // Tout le reste nécessite une authentification (ou permitAll() pour tester)
                        .anyExchange().permitAll() // Mettez .authenticated() plus tard quand ça marchera
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Autoriser l'origine Angular (soyez précis)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://192.168.100.1:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
