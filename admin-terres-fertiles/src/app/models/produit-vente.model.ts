// produit-vente.model.ts
import { Melange } from '../services/melange.service';

export interface ChantierInfo {
  id: number;
  nom: string;
  localisation: string;
}

export interface PlateformeInfo {
  id: number;
  nom: string;
  localisation: string;
}

export interface ProduitVente {
  id: number;
  utilisateur: string; // Utilisateur sous forme de string selon l'API
  reference_produit: string;
  melange: Melange; // Objet complet Melange selon l'API
  fournisseur: string;
  nom_site?: string | null;
  volume_initial: string; // String selon l'API
  volume_disponible: string; // String selon l'API
  date_disponibilite: string; // format ISO "YYYY-MM-DD"
  commentaires_analyses?: string | null;
  volume_vendu?: number | null;
  acheteur?: string | null;
  date_achat?: string | null; // format ISO "YYYY-MM-DD"
  periode_destockage?: string;
  localisation_projet?: string;
  date_creation: string; // format ISO "YYYY-MM-DD"
  pret_pour_vente: boolean;
  // Nouvelles propriétés de l'API
  chantier_info?: ChantierInfo;
  plateforme?: PlateformeInfo;
  temps_sur_plateforme?: number;
  delai_avant_disponibilite?: number;
  documents?: any[];
  analyses?: any[];
}
