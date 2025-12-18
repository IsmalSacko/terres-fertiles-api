export interface AmendementOrganique {
  id?: number;
  nom: string;
  numero_sequence: number;
  plateforme?: number | null;
  fournisseur: string;
  date_reception: string;
  commune: string;
  debut_date_fabrication: string;
  volume_disponible: number;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  responsable?: number | null;
}

export interface CreateAmendementOrganique {
  plateforme?: number | null;
  nom?: string;
  fournisseur: string;
  date_reception: string;
  commune: string;
  debut_date_fabrication: string;
  volume_disponible: number;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}