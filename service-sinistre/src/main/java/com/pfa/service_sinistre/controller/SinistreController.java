package com.pfa.service_sinistre.controller;

import com.pfa.service_sinistre.dto.ClientDTO;
import com.pfa.service_sinistre.dto.ContratDTO;
import com.pfa.service_sinistre.dto.UpdateStatutDTO;
import com.pfa.service_sinistre.entity.Sinistre;
import com.pfa.service_sinistre.entity.StatutSinistre;
import com.pfa.service_sinistre.event.SinistreEvent;
import com.pfa.service_sinistre.kafka.SinistreEventProducer;
import com.pfa.service_sinistre.repository.SinistreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sinistres")
public class SinistreController {

    @Autowired
    private SinistreEventProducer eventProducer;

    @Autowired
    private SinistreRepository sinistreRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY = "http://localhost:8080";
    private static final String SERVICE_AUTH_URL = API_GATEWAY + "/auth/users/";
    private static final String SERVICE_CONTRAT_URL = API_GATEWAY + "/contracts/";

    // ✅ GET tous les sinistres (avec filtrage RBAC)
    @GetMapping
    public ResponseEntity<List<Sinistre>> getAllSinistres(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        List<Sinistre> sinistres;

        if ("CLIENT".equals(userRole) && userId != null) {
            // Client voit UNIQUEMENT ses sinistres
            sinistres = sinistreRepository.findByClientId(userId);
        } else {
            // GESTIONNAIRE et ADMIN voient TOUS les sinistres
            sinistres = sinistreRepository.findAll();
        }

        sinistres.forEach(this::enrichirAvecDonneesClient);
        return ResponseEntity.ok(sinistres);
    }

    // ✅ GET sinistre par ID
    @GetMapping("/{id}")
    public ResponseEntity<Sinistre> getSinistreById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    // Si CLIENT, vérifier qu'il est propriétaire
                    if ("CLIENT".equals(userRole) && !sinistre.getClientId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Sinistre>build();
                    }
                    enrichirAvecDonneesClient(sinistre);
                    return ResponseEntity.ok(sinistre);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ POST créer un sinistre (avec validation complète)
    @PostMapping
    public ResponseEntity<?> createSinistre(
            @RequestBody Sinistre sinistre,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        // 1. Vérifier que le contrat existe
        ContratDTO contrat = getContratById(sinistre.getContratId());
        System.out.println("=== DEBUG CONTRAT ===");
        System.out.println("Contrat ID: " + contrat.getId());
        System.out.println("Statut reçu: '" + contrat.getStatut() + "'");
        System.out.println("Statut class: " + (contrat.getStatut() != null ? contrat.getStatut().getClass().getName() : "NULL"));
        System.out.println("Equals ACTIF: " + "ACTIF".equals(contrat.getStatut()));
        if (contrat == null) {
            return ResponseEntity.badRequest()
                    .body("Contrat introuvable avec l'ID : " + sinistre.getContratId());
        }

        // 2. Vérifier que le contrat est ACTIF
        if (contrat.getStatut() == null || !contrat.getStatut().equalsIgnoreCase("ACTIVE")) {
            return ResponseEntity.badRequest()
                    .body("Le contrat doit être actif pour déclarer un sinistre");
        }

        // 3. SÉCURITÉ : Hériter automatiquement le clientId du contrat
        sinistre.setClientId(contrat.getClientId());

        // 4. Si CLIENT, vérifier qu'il est bien propriétaire du contrat
        if ("CLIENT".equals(userRole) && !contrat.getClientId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Vous ne pouvez créer un sinistre que sur vos propres contrats");
        }

        // 5. Générer les valeurs par défaut
        sinistre.setNumeroSinistre("SIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sinistre.setStatut(StatutSinistre.DECLARE);
        sinistre.setDateDeclaration(LocalDateTime.now());

        // 6. Sauvegarder
        Sinistre saved = sinistreRepository.save(sinistre);
        enrichirAvecDonneesClient(saved);
        eventProducer.send(new SinistreEvent(saved.getId(), saved.getNumeroSinistre(), saved.getStatut().name()));

        return ResponseEntity.ok(saved);
    }

    // ✅ PUT mettre à jour le statut (GESTIONNAIRE/ADMIN uniquement)
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(
            @PathVariable Long id,
            @RequestBody UpdateStatutDTO dto,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        if ("CLIENT".equals(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Seul un gestionnaire peut modifier le statut");
        }

        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    sinistre.setStatut(dto.getStatut());

                    // Si passage à EN_COURS, assigner le gestionnaire
                    if (dto.getStatut() == StatutSinistre.EN_COURS && userId != null) {
                        sinistre.setGestionnaireId(userId);
                    }

                    // Si montant approuvé fourni
                    if (dto.getMontantApprouve() != null) {
                        sinistre.setMontantApprouve(dto.getMontantApprouve());
                    }

                    Sinistre updated = sinistreRepository.save(sinistre);
                    enrichirAvecDonneesClient(updated);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET sinistres par client
    @GetMapping("/client/{clientId}")
    public List<Sinistre> getSinistresByClientId(@PathVariable Long clientId) {
        List<Sinistre> sinistres = sinistreRepository.findByClientId(clientId);
        sinistres.forEach(this::enrichirAvecDonneesClient);
        return sinistres;
    }

    // ✅ GET sinistres par contrat
    @GetMapping("/contrat/{contratId}")
    public List<Sinistre> getSinistresByContratId(@PathVariable Long contratId) {
        List<Sinistre> sinistres = sinistreRepository.findByContratId(contratId);
        sinistres.forEach(this::enrichirAvecDonneesClient);
        return sinistres;
    }

    // ✅ DELETE sinistre (CLIENT peut supprimer si DECLARE seulement)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSinistre(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        return sinistreRepository.findById(id)
                .map(sinistre -> {
                    // CLIENT ne peut supprimer que SES sinistres en statut DECLARE
                    if ("CLIENT".equals(userRole)) {
                        if (!sinistre.getClientId().equals(userId)) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                        }
                        if (sinistre.getStatut() != StatutSinistre.DECLARE) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Vous ne pouvez supprimer que les sinistres non traités");
                        }
                    }

                    sinistreRepository.delete(sinistre);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Service Sinistre is running");
    }

    // ═════════════════════════════════════════════
    // MÉTHODES PRIVÉES
    // ═════════════════════════════════════════════

    private void enrichirAvecDonneesClient(Sinistre sinistre) {
        try {
            String url = SERVICE_AUTH_URL + sinistre.getClientId();
            ClientDTO client = restTemplate.getForObject(url, ClientDTO.class);
            if (client != null) {
                sinistre.setClientNom(client.getNom() + " " + client.getPrenom());
                sinistre.setClientNom(client.getEmail());
            } else {
                sinistre.setClientNom("Client non trouvé");
                sinistre.setClientNom("N/A");
            }
        } catch (Exception e) {
            sinistre.setClientNom("Client inconnu (service indisponible)");
            sinistre.setClientNom("N/A");
        }
        enrichirAvecDonneesGestionnaire(sinistre);
    }
    private void enrichirAvecDonneesGestionnaire(Sinistre sinistre) {
        if (sinistre.getGestionnaireId() == null) {
            sinistre.setGestionnaireNom(null);
            sinistre.setGestionnaireEmail(null);
            return;
        }
        try {
            String url = SERVICE_AUTH_URL + sinistre.getGestionnaireId();
            ClientDTO gestionnaire = restTemplate.getForObject(url, ClientDTO.class);
            if (gestionnaire != null) {
                sinistre.setGestionnaireNom(
                        (gestionnaire.getNom() != null ? gestionnaire.getNom() : "") + " " +
                                (gestionnaire.getPrenom() != null ? gestionnaire.getPrenom() : "")
                );
                sinistre.setGestionnaireEmail(gestionnaire.getEmail());
            } else {
                sinistre.setGestionnaireNom("Gestionnaire #" + sinistre.getGestionnaireId());
                sinistre.setGestionnaireEmail("N/A");
            }
        } catch (Exception e) {
            sinistre.setGestionnaireNom("Gestionnaire #" + sinistre.getGestionnaireId());
            sinistre.setGestionnaireEmail("(indisponible)");
        }
    }

    private ContratDTO getContratById(Long contratId) {
        try {
            String url = SERVICE_CONTRAT_URL + contratId;
            return restTemplate.getForObject(url, ContratDTO.class);
        } catch (Exception e) {
            return null;
        }
    }
}