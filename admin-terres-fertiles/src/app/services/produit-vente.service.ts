import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { CreateProduitVente } from '../models/produit-vente.model';

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
    console.log('Récupération du produit ID:', id);
    console.log('URL API:', `${this.apiUrl}${id}/`);
    
    try {
      const response = await axios.get<ProduitVente>(
        `${this.apiUrl}${id}/`,
        this.getHeaders()
      );
      console.log('Réponse API produit:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
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
      console.log('🚀 Envoi des données vers l\'API:', produitData);
      const response = await axios.post<ProduitVente>(
        this.apiUrl,
        produitData,
        this.getHeaders()
      );
      console.log('✅ Réponse de l\'API:', response.data);
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
      const response = await axios.patch<ProduitVente>(
        `${this.apiUrl}${id}/`,
        payload,
        this.getHeaders()
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
      await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
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