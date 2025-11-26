import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateProduitVente } from '../models/produit-vente.model';
import { ApiService } from './api.service';
import axios from 'axios';

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
  pret_pour_vente?: boolean;
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
  //  Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  // IMPORTANT: ajouter le slash final ici. Django/DRF attend les endpoints avec a trailing slash
  // (sinon POST vers /api/produits sans slash retourne 404 car Django ne redirige pas les POST).
  private readonly apiUrl = `${this.base}produits/`;
  constructor() {}

  private apiService = inject(ApiService);


  async getProduits(page: number = 1, pageSize: number = 10): Promise<ProduitVenteResponse> {
    try {
      const response = await this.apiService.get<ProduitVente[]>(
        `${this.apiUrl}?page=${page}&page_size=${pageSize}`
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
    console.log('Récupération du produit ID:', id);
    console.log('URL API:', `${this.apiUrl}${id}/`);
    
    try {
      const response = await this.apiService.get<ProduitVente>(
        `${this.apiUrl}${id}/`
      );
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }

  async searchProduits(query: string): Promise<ProduitVenteResponse> {
    try {
      const response = await this.apiService.get<ProduitVente[]>(
        `${this.apiUrl}?search=${query}`
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
      const response = await this.apiService.get<ProduitVente[]>(
        this.apiUrl
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

  /**
   * Compte le nombre de produits ayant un stock disponible (> 0 m³).
   * Utile pour afficher le nombre d'éléments en stock dans le dashboard.
   */
  async getStockDisponibleCount(): Promise<number> {
    const produits = await this.getAll();
    const toNumber = (v: any) => {
      if (v === null || v === undefined) return 0;
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(/\u202F/g, ''));
      return isNaN(n) ? 0 : n;
    };
    return produits.filter(p => toNumber(p.volume_disponible) > 0).length;
  }

  async createProduitVente(produitData: CreateProduitVente): Promise<ProduitVente> {
    try {
      const response = await this.apiService.post<ProduitVente>(
        this.apiUrl,
        produitData
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du produit:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du produit');
      }
      throw error;
    }
  }

  async updateProduitVente(id: number, payload: Partial<ProduitVente>): Promise<ProduitVente> {
    try {
      const response = await this.apiService.patch<ProduitVente>(
        `${this.apiUrl}${id}/`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }

  async deleteProduitVente(id: any): Promise<void> {
    try {
      await this.apiService.delete(`${this.apiUrl}${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }
}