// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { ContractService } from '../../../core/services/contract.service';
import { UserService, User } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChartService } from '../../../core/services/chart.service';
import { Contract, ContractStatus, TypeContrat } from '../../../shared/models/contract.model';

// Enregistrer les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  // Références aux canvas pour les graphiques
  @ViewChild('contractsByTypeChart') contractsByTypeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('contractsByStatusChart') contractsByStatusCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('premiumDistributionChart') premiumDistributionCanvas?: ElementRef<HTMLCanvasElement>;

  // Instances des graphiques
  private contractsByTypeChart?: Chart;
  private contractsByStatusChart?: Chart;
  private premiumDistributionChart?: Chart;
  contracts: Contract[] = [];
  clients: User[] = [];
  loading = false;
  loadingClients = false;
  error: string | null = null;

  creating = false;
  createError: string | null = null;

  // Pour le template (status pills)
  readonly contractStatusEnum = {
    ACTIVE: 'ACTIVE' as ContractStatus,
    CANCELED: 'CANCELED' as ContractStatus,
    EXPIRED: 'EXPIRED' as ContractStatus,
  };

  // Enum pour le template
  readonly TypeContrat = TypeContrat;

  newContract: Contract = {
    clientId: 0,
    type: TypeContrat.AUTO,
    primeAnnuelle: 0,
    dateDebut: '',
    dateFin: '',
    statut: 'ACTIVE',
  };

  constructor(
    private contractService: ContractService,
    private userService: UserService,
    private notificationService: NotificationService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadClients();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront créés après le chargement des données
  }

  /**
   * Charger tous les clients
   */
  loadClients(): void {
    this.loadingClients = true;
    console.log('🔍 Chargement des clients...');

    this.userService.getAllClients().subscribe({
      next: (data) => {
        console.log('✅ Clients récupérés:', data);
        console.log('Nombre de clients:', data.length);
        this.clients = data;
        this.loadingClients = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement clients:', err);
        console.error('Status:', err.status);
        console.error('URL appelée:', err.url);
        console.error('Message:', err.message);
        this.loadingClients = false;

        // Afficher l'erreur à l'utilisateur
        this.createError = `Impossible de charger les clients: ${err.status} - ${err.statusText || err.message}`;
      }
    });
  }

  /**
   * Obtenir le nom d'affichage d'un client
   */
  getClientFullName(client: User): string {
    // Utiliser username car nom/prenom sont souvent null
    return client.username || client.email || 'Utilisateur';
  }

  // --- Statistiques rapides ---
  get totalContracts(): number {
    return this.contracts.length;
  }

  get activeContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.ACTIVE
    ).length;
  }

  get canceledContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.CANCELED
    ).length;
  }

  get expiredContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.EXPIRED
    ).length;
  }

  // --- CRUD ---

  loadContracts(): void {
    this.loading = true;
    this.error = null;

    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
        // Créer les graphiques après le chargement des données
        setTimeout(() => this.initCharts(), 100);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des contrats.';
        this.loading = false;
      },
    });
  }

  /**
   * Initialise tous les graphiques
   */
  private initCharts(): void {
    this.createContractsByTypeChart();
    this.createContractsByStatusChart();
    this.createPremiumDistributionChart();
  }

  /**
   * Graphique 1: Répartition des contrats par type
   */
  private createContractsByTypeChart(): void {
    if (!this.contractsByTypeCanvas) return;

    // Compter les contrats par type
    const typeCounts = new Map<string, number>();
    this.contracts.forEach(contract => {
      const type = contract.type || 'Autre';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    const labels = Array.from(typeCounts.keys());
    const data = Array.from(typeCounts.values());

    const config = this.chartService.getBarChartConfiguration(
      labels,
      [{ label: 'Nombre de contrats', data }]
    );

    this.contractsByTypeChart = new Chart(
      this.contractsByTypeCanvas.nativeElement,
      config
    );
  }

  /**
   * Graphique 2: Répartition des contrats par statut
   */
  private createContractsByStatusChart(): void {
    if (!this.contractsByStatusCanvas) return;

    const statusCounts = {
      'Actifs': this.activeContracts,
      'Annulés': this.canceledContracts,
      'Expirés': this.expiredContracts
    };

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = ['#10b981', '#ef4444', '#f59e0b'];

    const config = this.chartService.getDoughnutChartConfiguration(
      labels,
      data,
      colors
    );

    this.contractsByStatusChart = new Chart(
      this.contractsByStatusCanvas.nativeElement,
      config
    );
  }

  /**
   * Graphique 3: Distribution des primes annuelles
   */
  private createPremiumDistributionChart(): void {
    if (!this.premiumDistributionCanvas) return;

    // Grouper les contrats par type et calculer la prime moyenne
    const premiumsByType = new Map<string, number[]>();
    this.contracts.forEach(contract => {
      const type = contract.type || 'Autre';
      const premium = contract.primeAnnuelle || 0;
      if (!premiumsByType.has(type)) {
        premiumsByType.set(type, []);
      }
      premiumsByType.get(type)!.push(premium);
    });

    // Calculer les moyennes
    const labels = Array.from(premiumsByType.keys());
    const averages = labels.map(type => {
      const primes = premiumsByType.get(type) || [];
      return primes.length > 0
        ? Math.round(primes.reduce((a, b) => a + b, 0) / primes.length)
        : 0;
    });

    const config = this.chartService.getLineChartConfiguration(
      labels,
      [{
        label: 'Prime annuelle moyenne (DH)',
        data: averages,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)'
      }]
    );

    this.premiumDistributionChart = new Chart(
      this.premiumDistributionCanvas.nativeElement,
      config
    );
  }

  /**
   * Nettoie les graphiques à la destruction du composant
   */
  ngOnDestroy(): void {
    if (this.contractsByTypeChart) {
      this.contractsByTypeChart.destroy();
    }
    if (this.contractsByStatusChart) {
      this.contractsByStatusChart.destroy();
    }
    if (this.premiumDistributionChart) {
      this.premiumDistributionChart.destroy();
    }
  }

  createContract(): void {
    this.createError = null;

    if (!this.newContract.clientId) {
      this.createError = 'Client ID est obligatoire.';
      return;
    }

    this.creating = true;

    this.contractService.create(this.newContract).subscribe({
      next: () => {
        this.newContract = {
          clientId: 0,
          type: TypeContrat.AUTO,
          primeAnnuelle: 0,
          dateDebut: '',
          dateFin: '',
          statut: 'ACTIVE',
        };
        this.creating = false;
        this.loadContracts();
      },
      error: (err) => {
        console.error(err);
        this.createError = 'Erreur lors de la création du contrat.';
        this.creating = false;
      },
    });
  }

  async cancelContract(c: Contract): Promise<void> {
    if (!c.id) return;

    const confirmed = await this.notificationService.confirmAction(`Annuler le contrat #${c.id} ?`);
    if (!confirmed) return;

    this.contractService.cancel(c.id).subscribe({
      next: () => {
        this.notificationService.success('Contrat annulé avec succès');
        this.loadContracts();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error("Erreur lors de l'annulation du contrat.");
      },
    });
  }
}
