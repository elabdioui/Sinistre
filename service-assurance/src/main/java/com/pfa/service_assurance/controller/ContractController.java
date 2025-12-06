package com.pfa.service_assurance.controller;

import com.pfa.service_assurance.DTO.ClientDTO;
import com.pfa.service_assurance.entity.Contrat;

import com.pfa.service_assurance.entity.StatutContrat;


import com.pfa.service_assurance.repository.ContratRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/contracts")
public class ContractController {

    @Autowired
    private ContratRepository repository;

    @Autowired
    RestTemplate restTemplate;

    private static final String API_GATEWAY = "http://localhost:8080";
    private static final String SERVICE_AUTH_URL = API_GATEWAY + "/auth";

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Contrat c) {
        c.setId(null); // on ignore l'id envoyé par le client
        return ResponseEntity.ok(repository.save(c));
    }



    @GetMapping()
    public List<Contrat> getAll() {
        return repository.findAll();
    }


    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        Contrat contract = repository.findById(id).orElseThrow(() -> new RuntimeException("Contract not found"));
        contract.setStatut(StatutContrat.CANCELED);
        repository.save(contract);
        return ResponseEntity.ok("Contract cancelled successfully");
    }

    @GetMapping("/client/{clientId}")
    public List<Contrat> getSinistresByClientId(@PathVariable Long clientId) {
        List<Contrat> contracts = repository.findByClientId(clientId);
        contracts.forEach(this::enrichirAvecDonneesClient);
        return contracts;
    }

    private void enrichirAvecDonneesClient(Contrat contract) {
        try {
            String url = SERVICE_AUTH_URL  + contract.getClientId();
            ClientDTO client = restTemplate.getForObject(url, ClientDTO.class);
            if (client != null) {
                contract.setClientNom(client.getNom() + " " + client.getPrenom());
                contract.setClientEmail(client.getEmail());
            } else {
                contract.setClientNom("Client non trouvé");
                contract.setClientEmail("N/A");
            }
        } catch (Exception e) {
            // En cas d'erreur de communication, on continue avec des valeurs par défaut
            contract.setClientNom("Client inconnu (service indisponible)");
            contract.setClientEmail("N/A");
        }
    }
}
