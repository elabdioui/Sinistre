package com.pfa.service_assurance.repository;

import com.pfa.service_assurance.entity.Contrat;
import com.pfa.service_assurance.entity.StatutContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {


    List<Contrat> findByClientId(Long clientId);


    Optional<Contrat> findByNumero(String numero);


    List<Contrat> findByStatut(StatutContrat statut);


    List<Contrat> findByClientIdAndStatut(Long clientId, StatutContrat statut);

    boolean existsByNumero(String numero);
}