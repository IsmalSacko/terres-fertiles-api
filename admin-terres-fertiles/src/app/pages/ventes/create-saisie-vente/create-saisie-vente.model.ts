export interface CreateSaisieVente {
  nom_client: string;
  volume_tonne: string;
  date_vente: string;
  nom_chantier_recepteur: string;
  adresse_chantier: string;
  est_validee: boolean;
  produit: number;
}

export interface SaisieVenteResponse extends CreateSaisieVente {
  id: number;
  date_achat: string;
  date_modification_vente: string;
}
