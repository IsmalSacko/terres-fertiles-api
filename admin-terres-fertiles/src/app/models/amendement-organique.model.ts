export interface AmendementOrganique {
  id?: number;
  nom: string;
  numero_sequence: number;
  plateforme?: number | null;
  fournisseur: string;
  date_reception: string;
  commune: string;
  date_semis: string;
  volume_disponible: number;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  responsable?: number | null;
}

export interface CreateAmendementOrganique {
  plateforme?: number | null;
  fournisseur: string;
  date_reception: string;
  commune: string;
  date_semis: string;
  volume_disponible: number;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}