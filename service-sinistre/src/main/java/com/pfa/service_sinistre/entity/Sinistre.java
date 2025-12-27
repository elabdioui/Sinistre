package com.pfa.service_sinistre.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sinistre")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sinistre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroSinistre;

    @Column(nullable = false)
    private String description;

    @Column(name = "date_sinistre")
    private LocalDateTime dateSinistre;  // ✅ Date du sinistre

    @Column(name = "date_declaration")
    private LocalDateTime dateDeclaration = LocalDateTime.now();

    @Column(name = "montant_demande")
    private Double montantDemande;

    @Column(name = "montant_approuve")
    private Double montantApprouve;  // ✅ Nouveau champ

    @Enumerated(EnumType.STRING)
    private StatutSinistre statut = StatutSinistre.DECLARE;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "contrat_id", nullable = false)  // ✅ Nouveau champ
    private Long contratId;

    @Column(name = "gestionnaire_id")  // ✅ ID du gestionnaire assigné
    private Long gestionnaireId;

    // Champs enrichis (non persistés)
    @Transient
    private String clientNom;

    // ✅ Champs enrichis - GESTIONNAIRE
    @Transient
    private String gestionnaireNom;

    @Transient
    private String gestionnaireEmail;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroSinistre() {
        return numeroSinistre;
    }

    public void setNumeroSinistre(String numeroSinistre) {
        this.numeroSinistre = numeroSinistre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateSinistre() {
        return dateSinistre;
    }

    public void setDateSinistre(LocalDateTime dateSinistre) {
        this.dateSinistre = dateSinistre;
    }

    public LocalDateTime getDateDeclaration() {
        return dateDeclaration;
    }

    public void setDateDeclaration(LocalDateTime dateDeclaration) {
        this.dateDeclaration = dateDeclaration;
    }

    public Double getMontantDemande() {
        return montantDemande;
    }

    public void setMontantDemande(Double montantDemande) {
        this.montantDemande = montantDemande;
    }

    public Double getMontantApprouve() {
        return montantApprouve;
    }

    public void setMontantApprouve(Double montantApprouve) {
        this.montantApprouve = montantApprouve;
    }

    public StatutSinistre getStatut() {
        return statut;
    }

    public void setStatut(StatutSinistre statut) {
        this.statut = statut;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getContratId() {
        return contratId;
    }

    public void setContratId(Long contratId) {
        this.contratId = contratId;
    }

    public Long getGestionnaireId() {
        return gestionnaireId;
    }

    public void setGestionnaireId(Long gestionnaireId) {
        this.gestionnaireId = gestionnaireId;
    }

    public String getClientNom() {
        return clientNom;
    }

    public void setClientNom(String clientNom) {
        this.clientNom = clientNom;
    }

    public String getGestionnaireNom() {
        return gestionnaireNom;
    }

    public void setGestionnaireNom(String gestionnaireNom) {
        this.gestionnaireNom = gestionnaireNom;
    }

    public String getGestionnaireEmail() {
        return gestionnaireEmail;
    }

    public void setGestionnaireEmail(String gestionnaireEmail) {
        this.gestionnaireEmail = gestionnaireEmail;
    }
}