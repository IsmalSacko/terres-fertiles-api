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

export interface CreateProduitVente {
  melange: number; // ID du mélange
  fournisseur: string;
  nom_site?: string;
  volume_initial: number;
  date_disponibilite: string; // format "YYYY-MM-DD"
  commentaires_analyses?: string;
  volume_vendu?: number;
  acheteur?: string;
  date_achat?: string; // format "YYYY-MM-DD"
  periode_destockage?: string;
  localisation_projet?: string;
  pret_pour_vente: boolean;
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
