package com.pfa.service_sinistre.repository;

import com.pfa.service_sinistre.entity.Sinistre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SinistreRepository extends JpaRepository<Sinistre, Long> {
    List<Sinistre> findByClientId(Long clientId);
    List<Sinistre> findByContratId(Long contratId);
    List<Sinistre> findByGestionnaireId(Long gestionnaireId);
}