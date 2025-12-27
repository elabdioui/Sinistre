// src/app/shared/models/contract.model.ts
// ============================================================
// Modèle Contract - Synchronisé avec le backend Spring Boot
// ============================================================

/** 📊 Statuts possibles d'un contrat */
export type ContractStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

/** 📋 Types de contrats disponibles */
export enum TypeContrat {
  AUTO = 'AUTO',
  HABITATION = 'HABITATION',
  SANTE = 'SANTE',
  VIE = 'VIE'
}

/** 📄 Interface principale pour un Contrat d'Assurance */
export interface Contract {
  /** ID unique du contrat */
  id?: number;

  /** ID du client propriétaire */
  clientId: number;

  /** Numéro du contrat (généré par le backend) */
  numero?: string;

  /** Type de contrat */
  type: TypeContrat;

  /** Prime annuelle en euros */
  primeAnnuelle?: number;

  /** Montant de couverture */
  montantCouverture?: number;

  /** Date de début du contrat (format ISO: YYYY-MM-DD) */
  dateDebut?: string;

  /** Date de fin du contrat (format ISO: YYYY-MM-DD) */
  dateFin?: string;

  /** Statut actuel du contrat */
  statut?: ContractStatus;

  // Données enrichies depuis le service Auth
  /** Nom complet du client (enrichi) */
  clientNom?: string;

  /** Email du client (enrichi) */
  clientEmail?: string;
}

/** ✏️ DTO pour la création d'un contrat */
export interface ContractCreateDTO {
  clientId: number;
  type: TypeContrat;
  primeAnnuelle: number;
  montantCouverture?: number;
  dateDebut: string;
  dateFin: string;
}

/** 🔄 DTO pour la mise à jour d'un contrat */
export interface ContractUpdateDTO {
  type?: TypeContrat;
  primeAnnuelle?: number;
  montantCouverture?: number;
  dateFin?: string;
  statut?: ContractStatus;
}

/** 📊 Labels et couleurs pour l'affichage des statuts */
export const ContractStatusConfig: Record<ContractStatus, {
  label: string;
  color: string;
  badgeClass: string;
  emoji: string;
}> = {
  ACTIVE: {
    label: '✅ Actif',
    color: 'success',
    badgeClass: 'badge-active',
    emoji: '✅'
  },
  CANCELED: {
    label: '❌ Annulé',
    color: 'danger',
    badgeClass: 'badge-canceled',
    emoji: '❌'
  },
  EXPIRED: {
    label: '⏰ Expiré',
    color: 'warning',
    badgeClass: 'badge-expired',
    emoji: '⏰'
  }
};

/** 🎨 Helper pour obtenir le label d'un statut */
export function getContractStatusLabel(status: ContractStatus): string {
  return ContractStatusConfig[status]?.label || status;
}

/** 🎨 Helper pour obtenir la classe CSS d'un statut */
export function getContractStatusBadgeClass(status: ContractStatus): string {
  return ContractStatusConfig[status]?.badgeClass || '';
}

/** 🎨 Helper pour obtenir l'emoji d'un statut */
export function getContractStatusEmoji(status: ContractStatus): string {
  return ContractStatusConfig[status]?.emoji || '📄';
}

/** 📅 Formater une date pour l'affichage */
export function formatContractDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

/** 💰 Formater un montant pour l'affichage */
export function formatContractAmount(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/** ✅ Vérifier si un contrat est actif */
export function isContractActive(contract: Contract): boolean {
  return contract.statut === 'ACTIVE';
}

/** ✅ Vérifier si un contrat peut recevoir des sinistres */
export function canCreateSinistre(contract: Contract): boolean {
  return contract.statut === 'ACTIVE';
}
