package com.pfa.service_sinistre.dto;

import com.pfa.service_sinistre.entity.StatutSinistre;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO pour la mise à jour du statut d'un sinistre
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatutDTO {
    private StatutSinistre statut;
    private Double montantApprouve;
}