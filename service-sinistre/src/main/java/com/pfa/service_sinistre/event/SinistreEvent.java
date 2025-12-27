package com.pfa.service_sinistre.event;

import java.time.LocalDateTime;

public class SinistreEvent {
    private Long sinistreId;
    private String numeroSinistre;
    private String statut;
    private LocalDateTime timestamp;

    public SinistreEvent() {}

    public SinistreEvent(Long sinistreId, String numeroSinistre, String statut) {
        this.sinistreId = sinistreId;
        this.numeroSinistre = numeroSinistre;
        this.statut = statut;
        this.timestamp = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getSinistreId() { return sinistreId; }
    public void setSinistreId(Long sinistreId) { this.sinistreId = sinistreId; }
    public String getNumeroSinistre() { return numeroSinistre; }
    public void setNumeroSinistre(String numeroSinistre) { this.numeroSinistre = numeroSinistre; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
