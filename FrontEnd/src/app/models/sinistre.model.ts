export enum StatutSinistre {
  DECLARE = 'DECLARE',
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  INDEMNISE = 'INDEMNISE'
}

export { StatutSinistre as SinistreStatus };

export interface Sinistre {
  id?: number;
  numeroSinistre?: string;
  description: string;
  dateSinistre?: string;
  dateDeclaration?: string;
  montantDemande: number;
  montantApprouve?: number;
  statut: StatutSinistre;
  clientId: number;
  contratId: number;
  gestionnaireId?: number;
  clientNom?: string;
  clientEmail?: string;
  gestionnaireNom?: string;
  gestionnaireEmail?: string;
}

export interface CreateSinistreDTO {
  contratId: number;
  description: string;
  dateSinistre: string;
  montantDemande: number;
}

export interface UpdateStatutDTO {
  statut: StatutSinistre;
  montantApprouve?: number;
}

export interface SinistreStats {
  total: number;
  declare: number;
  enCours: number;
  valide: number;
  rejete: number;
  indemnise: number;
  montantTotalDemande?: number;
  montantTotalApprouve?: number;
}

export const StatutSinistreConfig: Record<StatutSinistre, {
  label: string;
  color: string;
  badgeClass: string;
  emoji: string;
  description: string;
}> = {
  [StatutSinistre.DECLARE]: {
    label: '📝 Déclaré',
    color: 'info',
    badgeClass: 'badge-declare',
    emoji: '📝',
    description: 'En attente de prise en charge'
  },
  [StatutSinistre.EN_COURS]: {
    label: '⏳ En cours',
    color: 'warning',
    badgeClass: 'badge-encours',
    emoji: '⏳',
    description: 'En cours de traitement'
  },
  [StatutSinistre.VALIDE]: {
    label: '✅ Validé',
    color: 'success',
    badgeClass: 'badge-valide',
    emoji: '✅',
    description: 'Validé'
  },
  [StatutSinistre.REJETE]: {
    label: '❌ Rejeté',
    color: 'danger',
    badgeClass: 'badge-rejete',
    emoji: '❌',
    description: 'Rejeté'
  },
  [StatutSinistre.INDEMNISE]: {
    label: '💰 Indemnisé',
    color: 'success',
    badgeClass: 'badge-indemnise',
    emoji: '💰',
    description: 'Indemnisé'
  }
};

export const SinistreActions: Record<StatutSinistre, StatutSinistre[]> = {
  [StatutSinistre.DECLARE]: [StatutSinistre.EN_COURS, StatutSinistre.REJETE],
  [StatutSinistre.EN_COURS]: [StatutSinistre.VALIDE, StatutSinistre.REJETE],
  [StatutSinistre.VALIDE]: [StatutSinistre.INDEMNISE],
  [StatutSinistre.REJETE]: [],
  [StatutSinistre.INDEMNISE]: []
};

export function getStatutSinistreLabel(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.label || statut;
}

export function getStatutSinistreBadgeClass(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.badgeClass || '';
}

export function getStatutSinistreEmoji(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.emoji || '📋';
}

export function canChangeStatut(currentStatut: StatutSinistre, newStatut: StatutSinistre): boolean {
  return SinistreActions[currentStatut]?.includes(newStatut) || false;
}

export function isStatutFinal(statut: StatutSinistre): boolean {
  return SinistreActions[statut]?.length === 0;
}

export function formatMontant(montant: number | undefined): string {
  if (montant === undefined || montant === null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
}

export function formatDateSinistre(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function calculateSinistreStats(sinistres: Sinistre[]): SinistreStats {
  return {
    total: sinistres.length,
    declare: sinistres.filter(s => s.statut === StatutSinistre.DECLARE).length,
    enCours: sinistres.filter(s => s.statut === StatutSinistre.EN_COURS).length,
    valide: sinistres.filter(s => s.statut === StatutSinistre.VALIDE).length,
    rejete: sinistres.filter(s => s.statut === StatutSinistre.REJETE).length,
    indemnise: sinistres.filter(s => s.statut === StatutSinistre.INDEMNISE).length,
    montantTotalDemande: sinistres.reduce((sum, s) => sum + (s.montantDemande || 0), 0),
    montantTotalApprouve: sinistres.reduce((sum, s) => sum + (s.montantApprouve || 0), 0)
  };
}
