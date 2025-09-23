import { Melange } from "../services/melange.service";
import { ProduitVente } from "./produit-vente.model";

export interface SaisieVente {
  id: number;
  responsable: string;
  nom_client: string;
  volume_tonne: string; // ou number, selon l'usage souhaité
  date_vente: string; // format "YYYY-MM-DD"
  nom_chantier_recepteur: string;
  adresse_chantier: string;
  est_validee: boolean;
  date_achat: string; // ISO 8601 (timestamp)
  date_modification_vente: string; // ISO 8601 (timestamp)
  produit: ProduitVente;
  melange: Melange; // ou un ID de Melange si tu préfères
}
