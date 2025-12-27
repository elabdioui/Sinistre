package com.pfa.service_assurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "contrats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeContrat type;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "montant_couverture")
    private Double montantCouverture;

    @Column(name = "prime_annuelle")
    private Double primeAnnuelle;

    @Column(name = "client_id", nullable = false)
    private Long clientId;


    @Transient
    private String clientNom;

    @Transient
    private String clientEmail;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutContrat statut = StatutContrat.ACTIVE;


    public boolean isValideAujourdhui() {
        LocalDate today = LocalDate.now();
        return !today.isBefore(dateDebut) && !today.isAfter(dateFin)
                && statut == StatutContrat.ACTIVE;
    }


    public boolean isExpire() {
        return LocalDate.now().isAfter(dateFin);
    }
}