package com.pfa.service_assurance.controller;

import com.pfa.service_assurance.DTO.ClientDTO;
import com.pfa.service_assurance.entity.Contrat;
import com.pfa.service_assurance.entity.StatutContrat;
import com.pfa.service_assurance.repository.ContratRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contracts")
public class ContratController {

    @Autowired
    private ContratRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY = "http://localhost:8080";
    private static final String SERVICE_AUTH_URL = API_GATEWAY + "/auth/users/";

    // ✅ GET tous les contrats (avec filtrage RBAC)
    @GetMapping
    public ResponseEntity<List<Contrat>> getAll(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        List<Contrat> contrats;

        // Si CLIENT → voir uniquement SES contrats
        if ("CLIENT".equals(userRole) && userId != null) {
            contrats = repository.findByClientId(userId);
        } else {
            // GESTIONNAIRE et ADMIN → voir TOUS les contrats
            contrats = repository.findAll();
        }

        contrats.forEach(this::enrichirAvecDonneesClient);
        return ResponseEntity.ok(contrats);
    }

    // ✅ GET contrat par ID (avec vérification ownership)
    @GetMapping("/{id}")
    public ResponseEntity<Contrat> getById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        return repository.findById(id)
                .map(contrat -> {
                    // Si CLIENT, vérifier qu'il est propriétaire
                    if ("CLIENT".equals(userRole) && !contrat.getClientId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Contrat>build();
                    }
                    enrichirAvecDonneesClient(contrat);
                    return ResponseEntity.ok(contrat);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST créer un contrat (GESTIONNAIRE/ADMIN uniquement)
    @PostMapping("/create")
    public ResponseEntity<?> create(
            @RequestBody Contrat contrat,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if ("CLIENT".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Seul un gestionnaire peut créer des contrats");
        }

        // Générer un numéro unique
        contrat.setId(null);
        contrat.setNumero("CTR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        contrat.setStatut(StatutContrat.ACTIVE);

        Contrat saved = repository.save(contrat);
        enrichirAvecDonneesClient(saved);
        return ResponseEntity.ok(saved);
    }

    // ✅ PATCH annuler un contrat
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        if ("CLIENT".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Seul un gestionnaire peut annuler des contrats");
        }

        return repository.findById(id)
                .map(contrat -> {
                    contrat.setStatut(StatutContrat.CANCELED);
                    repository.save(contrat);
                    return ResponseEntity.ok("Contrat résilié avec succès");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET contrats d'un client
    @GetMapping("/client/{clientId}")
    public List<Contrat> getByClientId(@PathVariable Long clientId) {
        List<Contrat> contrats = repository.findByClientId(clientId);
        contrats.forEach(this::enrichirAvecDonneesClient);
        return contrats;
    }

    // ✅ GET contrats actifs uniquement
    @GetMapping("/actifs")
    public ResponseEntity<List<Contrat>> getContratsActifs(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        List<Contrat> contrats;

        if ("CLIENT".equals(userRole) && userId != null) {
            contrats = repository.findByClientIdAndStatut(userId, StatutContrat.ACTIVE);
        } else {
            contrats = repository.findByStatut(StatutContrat.ACTIVE);
        }

        contrats.forEach(this::enrichirAvecDonneesClient);
        return ResponseEntity.ok(contrats);
    }

    // Méthode privée pour enrichir avec les données client
    private void enrichirAvecDonneesClient(Contrat contrat) {
        try {
            String url = SERVICE_AUTH_URL + contrat.getClientId();
            com.pfa.service_assurance.DTO.ClientDTO client = restTemplate.getForObject(url, ClientDTO.class);
            if (client != null) {
                contrat.setClientNom(client.getNom() + " " + client.getPrenom());
                contrat.setClientEmail(client.getEmail());
            } else {
                contrat.setClientNom("Client non trouvé");
                contrat.setClientEmail("N/A");
            }
        } catch (Exception e) {
            contrat.setClientNom("Client inconnu (service indisponible)");
            contrat.setClientEmail("N/A");
        }
    }
}