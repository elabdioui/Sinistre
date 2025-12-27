package com.pfa.service_sinistre.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * DTO pour récupérer les informations d'un contrat depuis le service-assurance
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContratDTO {
    private Long id;
    private String numero;
    private String type;  // AUTO, HABITATION, SANTE, VIE
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double primeAnnuelle;
    private String statut;  // ACTIF, SUSPENDU, RESILIE
    private Long clientId;
}