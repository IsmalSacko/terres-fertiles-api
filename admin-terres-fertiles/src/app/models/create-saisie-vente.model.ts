// Modèle pour la création de saisie de vente selon votre exemple
export interface CreateSaisieVente {
  nom_client: string;
  volume_tonne: string;
  date_vente: string; // format "YYYY-MM-DD"
  nom_chantier_recepteur: string;
  adresse_chantier: string;
  est_validee: boolean;
  produit: number; // ID du produit

}

import { Plateforme } from '../services/melange.service';
// Importer le type ProduitVente pour la réponse
import { ProduitVente } from './produit-vente.model';

// Modèle pour la réponse après création (avec les champs auto-générés)
export interface SaisieVenteResponse {
  id: number;
  nom_client: string;
  volume_tonne: string;
  date_vente: string;
  nom_chantier_recepteur: string;
  adresse_chantier: string;
  est_validee: boolean;
  date_achat: string; // ISO 8601 (timestamp) - généré par le serveur
  date_modification_vente: string; // ISO 8601 (timestamp) - généré par le serveur
  produit: ProduitVente; // Objet produit complet dans la réponse
 
}
