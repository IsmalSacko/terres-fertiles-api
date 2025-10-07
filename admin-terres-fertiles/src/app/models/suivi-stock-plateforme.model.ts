export interface SuiviStockPlateforme {
  id?: number;
  andain_numero: number;
  reference_suivi?: string;
  plateforme: number;
  plateforme_details?: {
    id: number;
    nom: string;
    localisation: string;
    entreprise_gestionnaire: string;
  };
  melange: number | null;
  melange_details?: {
    id: number;
    nom: string;
    etat: number;
    etat_display: string;
  };
  produit_vente?: number | null;
  produit_vente_details?: {
    id: number;
    reference_produit: string;
    pret_pour_vente: boolean;
  };
  volume_initial_m3: number;
  volume_restant_m3: number;
  statut: 'en_cours' | 'en_culture' | 'pret_vente' | 'ecoule' | 'suspendu';
  statut_display?: string;
  date_mise_en_andains: string;
  date_mise_en_culture?: string | null;
  date_previsionnelle_vente?: string | null;
  date_ecoulement?: string | null;
  recette?: string | null;
  remarques?: string | null;
  utilisateur?: number;
  utilisateur_details?: {
    id: number;
    username: string;
    company_name: string;
  };
  date_creation?: string;
  date_modification?: string;
  
  // Propriétés calculées
  volume_ecoule_m3?: number;
  taux_ecoulement_percent?: number;
  duree_stockage_jours?: number;
}

export interface CreateSuiviStockPlateforme {
  andain_numero: number;
  plateforme: number;
  melange: number | null;
  produit_vente?: number | null;
  volume_initial_m3: number;
  volume_restant_m3: number;
  statut: 'en_cours' | 'en_culture' | 'pret_vente' | 'ecoule' | 'suspendu';
  date_mise_en_andains: string;
  date_mise_en_culture?: string | null;
  date_previsionnelle_vente?: string | null;
  date_ecoulement?: string | null;
  recette?: string | null;
  remarques?: string | null;
}

export interface UpdateSuiviStockPlateforme extends CreateSuiviStockPlateforme {
  id: number;
}

export const STATUT_CHOICES = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_culture', label: 'En culture' },
  { value: 'pret_vente', label: 'Prêt pour vente' },
  { value: 'ecoule', label: 'Écoulé' },
  { value: 'suspendu', label: 'Suspendu' }
];

export const STATUT_COLORS = {
  'en_cours': '#ffc107',
  'en_culture': '#17a2b8', 
  'pret_vente': '#28a745',
  'ecoule': '#6c757d',
  'suspendu': '#dc3545'
};