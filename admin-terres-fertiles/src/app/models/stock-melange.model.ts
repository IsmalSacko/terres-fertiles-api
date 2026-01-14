import { Melange } from "../services/melange.service";
import { ProduitVente } from "./produit-vente.model";

export interface StockageMelange {
  id?: number;
  melange: Melange; // ou un ID de Melange si tu préfères
  etat_stock: 'maturation' | 'vente' | 'vendu';
  date_mise_en_stock?: string; // ISO date string
  volume: number;
  nom_melange?: string;
}
