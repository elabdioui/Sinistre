package com.pfa.service_sinistre.dto;

import lombok.Data;



@Data
public class ClientDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String adresse;
}