// src/app/features/sinistres/create-sinistre/create-sinistre.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { ContractService } from '../../../core/services/contract.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateSinistreDTO } from '../../../shared/models/sinistre.model';
import { Contract } from '../../../shared/models/contract.model';

@Component({
  selector: 'app-create-sinistre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-sinistre.component.html',
  styleUrls: ['./create-sinistre.component.css']
})
export class CreateSinistreComponent implements OnInit {
  // Liste des contrats actifs disponibles
  contratsActifs: Contract[] = [];

  // Données du formulaire
  sinistre: CreateSinistreDTO = {
    contratId: 0,
    description: '',
    dateSinistre: '',
    montantDemande: 0
  };

  loading = false;
  loadingContrats = false;
  error: string | null = null;
  success = false;

  constructor(
    private sinistreService: SinistreService,
    private contractService: ContractService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadContratsActifs();
  }

  /**
   * Charger les contrats actifs du client authentifié
   */
  loadContratsActifs(): void {
    this.loadingContrats = true;
    this.error = null;

    this.contractService.getContratsActifs().subscribe({
      next: (contrats: Contract[]) => {
        this.contratsActifs = contrats;
        this.loadingContrats = false;

        if (contrats.length === 0) {
          this.error = 'Vous n\'avez aucun contrat actif. Veuillez contacter votre gestionnaire.';
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement contrats:', err);
        this.error = 'Impossible de charger vos contrats actifs';
        this.loadingContrats = false;
      }
    });
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Convertir la date au format ISO avec heure (LocalDateTime attendu par le backend)
    const sinistreData = {
      ...this.sinistre,
      dateSinistre: this.sinistre.dateSinistre + 'T00:00:00'  // Ajouter l'heure
    };

    // 🔍 LOG: Données envoyées au backend
    console.log('=== CRÉATION SINISTRE ===');
    console.log('Données du formulaire:', sinistreData);
    console.log('User dans localStorage:', localStorage.getItem('user'));
    console.log('Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');

    this.sinistreService.create(sinistreData).subscribe({
      next: (created) => {
        console.log('✅ Sinistre créé avec succès:', created);
        this.success = true;
        this.loading = false;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/sinistres']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ ERREUR CRÉATION SINISTRE:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        console.error('Message:', err.message);

        // Afficher le message d'erreur du backend si disponible
        if (typeof err.error === 'string') {
          this.error = err.error;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = 'Erreur lors de la création du sinistre';
        }

        this.loading = false;
      }
    });
  }

  /**
   * Valider le formulaire
   */
  validateForm(): boolean {
    if (!this.sinistre.contratId || this.sinistre.contratId <= 0) {
      this.error = 'Veuillez sélectionner un contrat';
      return false;
    }

    if (!this.sinistre.description || this.sinistre.description.trim().length < 10) {
      this.error = 'La description doit contenir au moins 10 caractères';
      return false;
    }

    if (!this.sinistre.montantDemande || this.sinistre.montantDemande <= 0) {
      this.error = 'Le montant demandé doit être supérieur à 0';
      return false;
    }

    if (!this.sinistre.dateSinistre) {
      this.error = 'Veuillez sélectionner la date du sinistre';
      return false;
    }

    // Vérifier que la date du sinistre n'est pas dans le futur
    const dateSinistre = new Date(this.sinistre.dateSinistre);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (dateSinistre > aujourdhui) {
      this.error = 'La date du sinistre ne peut pas être dans le futur';
      return false;
    }

    return true;
  }

  /**
   * Annuler et retourner à la liste
   */
  async cancel(): Promise<void> {
    const confirmed = await this.notificationService.confirmAction('Annuler la création du sinistre ?');
    if (confirmed) {
      this.router.navigate(['/admin/sinistres']);
    }
  }

  /**
   * Obtenir le label d'affichage pour un contrat
   */
  getContratLabel(contrat: Contract): string {
    return `${contrat.numero || 'N/A'} - ${contrat.type} (${contrat.primeAnnuelle || 0}€/an)`;
  }

  /**
   * Obtenir la date actuelle au format YYYY-MM-DD
   */
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
