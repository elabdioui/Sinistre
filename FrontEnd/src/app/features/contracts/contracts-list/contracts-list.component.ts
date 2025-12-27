// src/app/features/contracts-list/contracts-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContractService } from '../../../core/services/contract.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Contract, ContractStatus, TypeContrat } from '../../../shared/models/contract.model';

interface Stats {
  total: number;
  active: number;
  canceled: number;
  expired: number;
}

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.css']
})
export class ContractsListComponent implements OnInit {
  // Data properties
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];

  // UI state
  loading = false;
  error: string | null = null;

  // Filters
  searchTerm = '';
  selectedStatus = 'ALL';

  // Statistics
  stats: Stats = {
    total: 0,
    active: 0,
    canceled: 0,
    expired: 0
  };

  // Status filter options
  statusOptions = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'ACTIVE', label: '✅ Actifs' },
    { value: 'CANCELED', label: '❌ Annulés' },
    { value: 'EXPIRED', label: '⏰ Expirés' }
  ];

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  /**
   * Load contracts based on user role
   * CLIENT: only their contracts
   * GESTIONNAIRE/ADMIN: all contracts
   */
  loadContracts(): void {
    this.loading = true;
    this.error = null;

    // Vérifier le rôle de l'utilisateur
    const isClient = this.authService.isClient();
    const currentUserId = this.authService.getCurrentUserId();
    const currentUserRole = this.authService.getCurrentUserRole();

    console.log('📋 ContractsListComponent - État utilisateur:', {
      userId: currentUserId,
      userRole: currentUserRole,
      isClient: isClient
    });

    if (isClient && currentUserId) {
      // CLIENT : charger uniquement ses contrats
      console.log('🔒 CLIENT détecté - Chargement des contrats pour ID:', currentUserId);
      this.contractService.getByClient(currentUserId).subscribe({
        next: (data) => {
          console.log('✅ Contrats client reçus:', data.length);
          this.contracts = data;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement contrats client:', err);
          this.error = 'Erreur lors du chargement de vos contrats.';
          this.loading = false;
        }
      });
    } else {
      // GESTIONNAIRE ou ADMIN : charger tous les contrats
      console.log('🔓 GESTIONNAIRE/ADMIN détecté - Chargement de tous les contrats');
      this.contractService.getAll().subscribe({
        next: (data) => {
          console.log('✅ Tous les contrats reçus:', data.length);
          this.contracts = data;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading contracts:', err);
          this.error = 'Erreur lors du chargement des contrats.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Handle search term change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Handle status filter change
   */
  onStatusChange(): void {
    this.applyFilters();
  }

  /**
   * Apply all active filters to the contracts list
   */
  applyFilters(): void {
    let filtered = [...this.contracts];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(contract =>
        contract.type?.toLowerCase().includes(term) ||
        contract.clientUsername?.toLowerCase().includes(term) ||
        contract.clientNom?.toLowerCase().includes(term) ||
        contract.clientEmail?.toLowerCase().includes(term) ||
        contract.numero?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(contract =>
        contract.statut === this.selectedStatus
      );
    }

    this.filteredContracts = filtered;
  }

  /**
   * Calculate statistics from the contracts list
   */
  calculateStats(): void {
    this.stats.total = this.contracts.length;
    this.stats.active = this.contracts.filter(c => c.statut === 'ACTIVE').length;
    this.stats.canceled = this.contracts.filter(c => c.statut === 'CANCELED').length;
    this.stats.expired = this.contracts.filter(c => c.statut === 'EXPIRED').length;
  }

  /**
   * Get CSS class for status badge
   */
  getStatusBadgeClass(statut: ContractStatus | undefined): string {
    if (!statut) return 'status-unknown';

    const classMap: Record<ContractStatus, string> = {
      'ACTIVE': 'status-active',
      'ACTIF': 'status-active',
      'CANCELED': 'status-canceled',
      'EXPIRED': 'status-expired'
    };

    return classMap[statut] || 'status-unknown';
  }

  /**
   * Get human-readable label for status
   */
  getStatusLabel(statut: ContractStatus | undefined): string {
    if (!statut) return 'Inconnu';

    const labelMap: Record<ContractStatus, string> = {
      'ACTIVE': '✅ Actif',
      'ACTIF': '✅ Actif',
      'CANCELED': '❌ Annulé',
      'EXPIRED': '⏰ Expiré'
    };

    return labelMap[statut] || statut;
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';

    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateStr;
    }
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return 'N/A';

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Cancel a contract
   */
  async cancelContract(contract: Contract): Promise<void> {
    if (!contract.id) {
      this.error = 'ID du contrat invalide';
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir annuler le contrat #${contract.id} ?`;
    const confirmed = await this.notificationService.confirmAction(confirmMessage);

    if (!confirmed) {
      return;
    }

    this.contractService.cancel(contract.id).subscribe({
      next: () => {
        // Update local state
        const index = this.contracts.findIndex(c => c.id === contract.id);
        if (index !== -1) {
          this.contracts[index].statut = 'CANCELED';
        }

        this.applyFilters();
        this.calculateStats();

        this.notificationService.success('Contrat annulé avec succès');
      },
      error: (err) => {
        console.error('Error canceling contract:', err);
        this.error = 'Erreur lors de l\'annulation du contrat.';
        this.notificationService.error('Erreur lors de l\'annulation du contrat.');
      }
    });
  }
}
