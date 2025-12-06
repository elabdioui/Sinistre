package com.pfa.service_admin.controller;

import com.pfa.service_admin.dto.DashboardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private RestTemplate restTemplate;

    private static final String GATEWAY_URL = "http://192.168.100.1:8080";

    private static final String SERVICE_ASSURANCE_URL = GATEWAY_URL + "/contracts";
    private static final String SERVICE_SINISTRE_URL   = GATEWAY_URL + "/sinistres";
    private static final String SERVICE_AUTH_URL       = GATEWAY_URL + "/auth";

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        try {
            Long totalClients = getTotalClients();
            Map<String, Long> statsSinistres = getStatistiquesSinistres();

            return ResponseEntity.ok(
                    new DashboardDTO(
                            totalClients,
                            statsSinistres.get("total"),
                            statsSinistres.get("enAttente"),
                            statsSinistres.get("valides"),
                            "Services opérationnels"
                    )
            );
        } catch (Exception ex) {
            return ResponseEntity.ok(new DashboardDTO(0L, 0L, 0L, 0L, "Erreur de communication"));
        }
    }

    @GetMapping("/services/status")
    public ResponseEntity<Map<String, String>> getServicesStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("assurance", checkService(SERVICE_ASSURANCE_URL + "/actuator/health"));
        status.put("sinistre", checkService(SERVICE_SINISTRE_URL + "/actuator/health"));
        status.put("auth", checkService(SERVICE_AUTH_URL + "/actuator/health"));
        return ResponseEntity.ok(status);
    }

    private String checkService(String url) {
        try {
            var res = restTemplate.getForEntity(url, String.class);
            return res.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }

    private Long getTotalClients() {
        try {
            Object[] clients = restTemplate.getForObject(SERVICE_ASSURANCE_URL, Object[].class);
            return clients != null ? (long) clients.length : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    private Map<String, Long> getStatistiquesSinistres() {
        Map<String, Long> stats = new HashMap<>();
        try {
            Object[] sinistres = restTemplate.getForObject(SERVICE_SINISTRE_URL, Object[].class);
            long total = sinistres != null ? sinistres.length : 0;

            stats.put("total", total);
            stats.put("enAttente", (long) (total * 0.3));
            stats.put("valides", (long) (total * 0.5));
        } catch (Exception e) {
            stats.put("total", 0L);
            stats.put("enAttente", 0L);
            stats.put("valides", 0L);
        }
        return stats;
    }
}