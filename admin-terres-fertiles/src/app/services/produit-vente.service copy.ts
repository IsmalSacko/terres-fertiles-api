import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

interface Chantier {
  id: number;
  nom: string;
  localisation: string;
  latitude: number;
  longitude: number;
}
export interface Plateforme {
  id: number;
  nom: string;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  date_creation: string | null;
}
interface Melange {
  id: number;
  nom: string;
  description: string;
  date_creation?: string;
}

export interface ProduitVente {
  id: number;
  utilisateur?: string; // Ajout du champ utilisateur
  chantier_info?: {
    id: number;
    nom: string;
    localisation: string;
    latitude: number;
    longitude: number;
  };
  plateforme?: {
    id: number;
    nom: string;
    localisation: string;
  };
  melange: Melange & {
    ingredients?: { id: number; nom: string; pourcentage: string; }[];
    amendements?: { id: number; nom: string; pourcentage: string; }[];
  };
  reference_produit: string;
  fournisseur: string;
  nom_site: string;
  date_creation?: string;              
  volume_initial: string;
  volume_disponible: string;
  date_disponibilite: string;
  commentaires_analyses: string | null;
  volume_vendu: string | null;
  acheteur: string | null;
  date_achat: string | null;
  periode_destockage: string | null;
  localisation_projet: string | null;
  temps_sur_plateforme?: number;
  delai_avant_disponibilite?: number;
  documents?: { nom_fichier: string; type_document: string; fichier: string; }[];
  analyses?: { laboratoire: string; date_analyse: string; fichier_pdf?: string; }[];
}


export interface ProduitVenteResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProduitVente[];
}

@Injectable({
  providedIn: 'root'
})
export class ProduitVenteService {
  private apiUrl = 'http://127.0.0.1:8000/api/produits/';
  private plateformeUrl = 'http://127.0.0.1:8000/api/plateformes/';

  constructor() {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    const headres = { headers: { Authorization: `Token ${token}` } };
  
    return headres;
  }
  async getProduits(page: number = 1, pageSize: number = 10): Promise<ProduitVenteResponse> {
    console.log('Appel API getProduits avec headers:', this.getHeaders());
    try {
      const response = await axios.get<ProduitVente[]>(
        `${this.apiUrl}?page=${page}&page_size=${pageSize}`,
        this.getHeaders()
      );
      console.log('Réponse API getProduits:', response.data);
      // Transformer la réponse en format ProduitVenteResponse
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } catch (error) {
      console.error('Erreur détaillée dans getProduits:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }

  async getProduitById(id: number): Promise<ProduitVente> {
    const response = await axios.get<ProduitVente>(
      `${this.apiUrl}${id}/`,
      this.getHeaders()
    );
    return response.data;
  }

  async searchProduits(query: string): Promise<ProduitVenteResponse> {
    try {
      const response = await axios.get<ProduitVente[]>(
        `${this.apiUrl}?search=${query}`,
        this.getHeaders()
      );
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data
      };
    } catch (error) {
      console.error('Erreur dans searchProduits:', error);
      throw error;
    }
  }

  async getAll(): Promise<ProduitVente[]> {
    try {
      const response = await axios.get<ProduitVente[]>(
        this.apiUrl,
        this.getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Erreur dans getAll:', error);
      throw error;
    }
  }
  async getProduitVenteCount(): Promise<number> {
  const produits = await this.getAll();
  return produits.length;
  }



}