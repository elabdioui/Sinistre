// src/app/shared/models/sinistre.model.ts

/** 📊 Statuts possibles d'un sinistre */
export enum StatutSinistre {
  DECLARE = 'DECLARE',
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  INDEMNISE = 'INDEMNISE'
}

/** Alias pour compatibilité */
export { StatutSinistre as SinistreStatus };

/** 📋 Interface principale pour un Sinistre */
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
  contratId: number;  // ✅ Obligatoire
  gestionnaireId?: number;

  // Données enrichies
  clientNom?: string;
  clientEmail?: string;
  gestionnaireNom?: string;
  gestionnaireEmail?: string;
}

/** ✏️ DTO pour la création d'un sinistre */
export interface CreateSinistreDTO {
  contratId: number;  // ✅ Obligatoire - clientId sera hérité automatiquement
  description: string;
  dateSinistre: string;
  montantDemande: number;
}

/** 🔄 DTO pour la mise à jour du statut d'un sinistre */
export interface UpdateStatutDTO {
  statut: StatutSinistre;
  montantApprouve?: number;
}

/** 📊 Configuration des statuts pour l'affichage */
export const StatutSinistreConfig = {
  [StatutSinistre.DECLARE]: {
    label: '📝 Déclaré',
    color: 'info',
    badgeClass: 'badge-declare',
    emoji: '📝'
  },
  [StatutSinistre.EN_COURS]: {
    label: '⏳ En cours',
    color: 'warning',
    badgeClass: 'badge-encours',
    emoji: '⏳'
  },
  [StatutSinistre.VALIDE]: {
    label: '✅ Validé',
    color: 'success',
    badgeClass: 'badge-valide',
    emoji: '✅'
  },
  [StatutSinistre.REJETE]: {
    label: '❌ Rejeté',
    color: 'danger',
    badgeClass: 'badge-rejete',
    emoji: '❌'
  },
  [StatutSinistre.INDEMNISE]: {
    label: '💰 Indemnisé',
    color: 'success',
    badgeClass: 'badge-indemnise',
    emoji: '💰'
  }
};

/** 🎨 Helper pour obtenir le label d'un statut */
export function getStatutSinistreLabel(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.label || statut;
}

/** 🎨 Helper pour obtenir la classe CSS d'un statut */
export function getStatutSinistreBadgeClass(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.badgeClass || '';
}

/** 🎨 Helper pour obtenir l'emoji d'un statut */
export function getStatutSinistreEmoji(statut: StatutSinistre): string {
  return StatutSinistreConfig[statut]?.emoji || '📋';
}

/** 🎯 Actions possibles sur un sinistre selon son statut */
export const SinistreActions: Record<StatutSinistre, StatutSinistre[]> = {
  [StatutSinistre.DECLARE]: [StatutSinistre.EN_COURS, StatutSinistre.REJETE],
  [StatutSinistre.EN_COURS]: [StatutSinistre.VALIDE, StatutSinistre.REJETE],
  [StatutSinistre.VALIDE]: [StatutSinistre.INDEMNISE],
  [StatutSinistre.REJETE]: [],
  [StatutSinistre.INDEMNISE]: []
};

/** 🔄 Helper pour vérifier si un statut peut être changé */
export function canChangeStatut(currentStatut: StatutSinistre, newStatut: StatutSinistre): boolean {
  return SinistreActions[currentStatut]?.includes(newStatut) || false;
}
