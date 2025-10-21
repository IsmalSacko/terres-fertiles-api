export interface FicheAgroPedodeSol {
  id?: number;
  EAP?: string;
  ville?: string;
  projet?: string;
  date?: string;
  commanditaire?: string;
  observateur?: string;
  nom_sondage: string;
  coord_x?: number;
  coord_y?: number;
  indication_lieu?: string;
  antecedent_climatique?: string;
  etat_surface?: string;
  couvert_vegetal?: string;
  test_beche?: string;
  horizons?: FicheHorizon[];
  photos?: FichePhoto[];
}


export interface FicheHorizon {
  id?: number;
  fiche: number;
  nom: string;
  profondeur?: string;
  texture?: string;
  humidite?: string;
  couleur?: string;
  hydromorphie?: string;
  test_hcl?: string;
  porosite?: string;
  compacite?: string;
  activite_bio?: string;
  commentaires?: string;
  representation_profil?: string;
  echantillon?: string;
  photos?: FichePhoto[];
}

export interface FichePhoto {
  id?: number;
  fiche?: number;
  horizon?: number;
  image: string;
  type_photo: 'environnement' | 'profil' | 'horizon' | 'sondage' | 'autre';
  description?: string;
  fiche_nom_sondage?: string;
  horizon_nom?: string;
}
