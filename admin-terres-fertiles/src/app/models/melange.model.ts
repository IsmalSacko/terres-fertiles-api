import { MelangeAmendement, MelangeEtat, MelangeIngredient, Plateforme } from "../services/melange.service";

export interface Melange {
  id?: number;
  nom: string;
  utilisateur?: string
  nom_complet?: string
  date_creation: string;
  reference_produit: string;
  plateforme: number | null;
  plateforme_details?: Plateforme;
  plateforme_nom?: string;
  fournisseur: string;
  producteur: string;
  couverture_vegetale: string | null;
  periode_melange: string;
  date_semis: string;
  references_analyses: string | null;
  etat: MelangeEtat;
  etat_display?: string;
  ordre_conformite: string | null;
  consignes_melange: string | null;
  controle_1: string | null;      
  controle_2: string | null;
  fiche_technique: string | null;
  ingredients: MelangeIngredient[];
  gisements: number[];
  amendements: MelangeAmendement []
}