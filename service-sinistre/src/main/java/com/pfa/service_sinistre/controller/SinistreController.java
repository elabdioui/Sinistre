package com.pfa.service_sinistre.controller;

import com.pfa.service_sinistre.entity.Sinistre;
import com.pfa.service_sinistre.entity.StatutSinistre;
import com.pfa.service_sinistre.dto.ClientDTO;
import com.pfa.service_sinistre.repository.SinistreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sinistres")
public class SinistreController {

    @Autowired
    private SinistreRepository sinistreRepository;

    @Autowired
    private RestTemplate restTemplate;

    // URL du service assurance
    private static final String API_GATEWAY = "http://localhost:8080";
    private static final String SERVICE_AUTH_URL = API_GATEWAY + "/auth";

    @GetMapping
    public List<Sinistre> getAllSinistres() {
        List<Sinistre> sinistres = sinistreRepository.findAll();
        // Enrichir chaque sinistre avec les données client
        sinistres.forEach(this::enrichirAvecDonneesClient);
        return sinistres;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sinistre> getSinistreById(@PathVariable Long id) {
        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    enrichirAvecDonneesClient(sinistre);
                    return ResponseEntity.ok().body(sinistre);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sinistre createSinistre(@RequestBody Sinistre sinistre) {
        // Générer un numéro de sinistre unique
        sinistre.setNumeroSinistre("SIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sinistre.setStatut(StatutSinistre.DECLARE);



        Sinistre savedSinistre = sinistreRepository.save(sinistre);
        enrichirAvecDonneesClient(savedSinistre);
        return savedSinistre;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sinistre> updateSinistre(@PathVariable Long id, @RequestBody Sinistre sinistreDetails) {
        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    sinistre.setDescription(sinistreDetails.getDescription());
                    sinistre.setMontantDemande(sinistreDetails.getMontantDemande());
                    sinistre.setStatut(sinistreDetails.getStatut());
                    sinistre.setClientId(sinistreDetails.getClientId());

                    Sinistre updated = sinistreRepository.save(sinistre);
                    enrichirAvecDonneesClient(updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Sinistre> updateStatut(@PathVariable Long id, @RequestBody StatutSinistre nouveauStatut) {
        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    sinistre.setStatut(nouveauStatut);
                    Sinistre updated = sinistreRepository.save(sinistre);
                    enrichirAvecDonneesClient(updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<Sinistre> getSinistresByClientId(@PathVariable Long clientId) {
        List<Sinistre> sinistres = sinistreRepository.findByClientId(clientId);
        sinistres.forEach(this::enrichirAvecDonneesClient);
        return sinistres;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSinistre(@PathVariable Long id) {
        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    sinistreRepository.delete(sinistre);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Service Sinistre is running");
    }

    // Méthode privée pour enrichir le sinistre avec les données du client via REST
    private void enrichirAvecDonneesClient(Sinistre sinistre) {
        try {
            String url = SERVICE_AUTH_URL  + sinistre.getClientId();
            ClientDTO client = restTemplate.getForObject(url, ClientDTO.class);
            if (client != null) {
                sinistre.setClientNom(client.getNom() + " " + client.getPrenom());
                sinistre.setClientEmail(client.getEmail());
            } else {
                sinistre.setClientNom("Client non trouvé");
                sinistre.setClientEmail("N/A");
            }
        } catch (Exception e) {
            // En cas d'erreur de communication, on continue avec des valeurs par défaut
            sinistre.setClientNom("Client inconnu (service indisponible)");
            sinistre.setClientEmail("N/A");
        }
    }

    // Méthode pour vérifier l'existence du client
    private boolean clientExists(Long clientId) {
        try {
            String url = SERVICE_AUTH_URL  + clientId;
            ResponseEntity<ClientDTO> response = restTemplate.getForEntity(url, ClientDTO.class);
            return response.getStatusCode().is2xxSuccessful() && response.getBody() != null;
        } catch (Exception e) {
            return false;
        }
    }
}