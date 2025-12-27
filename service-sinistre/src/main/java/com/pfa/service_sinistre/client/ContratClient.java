package com.pfa.service_sinistre.client;

import com.pfa.service_sinistre.dto.ContratDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ContratClient {

    private static final Logger log = LoggerFactory.getLogger(ContratClient.class);
    private final RestTemplate restTemplate;

    public ContratClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "contratService", fallbackMethod = "contratFallback")
    @Retry(name = "contratService")
    public ContratDTO getContrat(Long contratId) {
        log.info("🔄 Appel service-assurance pour contrat {}", contratId);
        String url = "http://localhost:8091/contrats/" + contratId;
        return restTemplate.getForObject(url, ContratDTO.class);
    }

    // Fallback si service-assurance indisponible
    public ContratDTO contratFallback(Long contratId, Exception ex) {
        log.warn("⚠️ Circuit ouvert! Fallback pour contrat {}: {}", contratId, ex.getMessage());
        return null; // ou un objet par défaut
    }
}
