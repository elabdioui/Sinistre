package com.pfa.service_admin.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private Long totalClients;
    private Long totalSinistres;
    private Long sinistresEnAttente;
    private Long sinistresValides;
    private String serviceStatus;
}
