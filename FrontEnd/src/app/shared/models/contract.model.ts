export type ContractStatus = 'ACTIVE' | 'ACTIF' | 'CANCELED' | 'EXPIRED';

export enum TypeContrat {
  AUTO = 'AUTO',
  HABITATION = 'HABITATION',
  SANTE = 'SANTE',
  VIE = 'VIE'
}

export interface Contract {
  id?: number;
  clientId: number;
  numero?: string;
  type: TypeContrat;
  primeAnnuelle?: number;
  dateDebut?: string;
  dateFin?: string;
  statut?: ContractStatus;
  clientUsername?: string;
  clientNom?: string;
  clientEmail?: string;
}

export interface ContractCreateDTO {
  clientId: number;
  type: TypeContrat;
  primeAnnuelle: number;
  startDate: string;
  endDate: string;
  statut?: ContractStatus;
}
