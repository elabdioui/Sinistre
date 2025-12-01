package com.pfa.service_assurance.repository;

import com.pfa.service_assurance.entity.Contrat;
import com.pfa.service_assurance.entity.StatutContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {

    /**
     * Trouver tous les contrats d'un client
     */
    List<Contrat> findByClientId(Long clientId);

    /**
     * Trouver un contrat par son numéro
     */
    Optional<Contrat> findByNumero(String numero);

    /**
     * Trouver les contrats par statut
     */
    List<Contrat> findByStatut(StatutContrat statut);

    /**
     * Trouver les contrats actifs d'un client
     */
    List<Contrat> findByClientIdAndStatut(Long clientId, StatutContrat statut);

    /**
     * Vérifier si un numéro de contrat existe
     */
    boolean existsByNumero(String numero);
}