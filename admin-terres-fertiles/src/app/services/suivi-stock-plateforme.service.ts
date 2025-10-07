import { Injectable } from '@angular/core';
import axios from 'axios';
import { SuiviStockPlateforme, CreateSuiviStockPlateforme, UpdateSuiviStockPlateforme } from '../models/suivi-stock-plateforme.model';

@Injectable({
  providedIn: 'root'
})
export class SuiviStockPlateformeService {
  private apiUrl = 'http://localhost:8000/api/suivi-stock-plateforme/';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  /**
   * Récupérer tous les suivis de stock avec filtres optionnels
   */
  async getSuivisStock(filters?: {
    plateforme?: number;
    melange?: number;
    statut?: string;
    date_debut?: string;
    date_fin?: string;
    search?: string;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: SuiviStockPlateforme[];
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.plateforme !== undefined && filters.plateforme !== null && !isNaN(filters.plateforme)) {
          params.set('plateforme', filters.plateforme.toString());
        }
        if (filters.melange) params.set('melange', filters.melange.toString());
        if (filters.statut) params.set('statut', filters.statut);
        if (filters.date_debut) params.set('date_debut', filters.date_debut);
        if (filters.date_fin) params.set('date_fin', filters.date_fin);
        if (filters.search) params.set('search', filters.search);
      }

      const url = params.toString() ? `${this.apiUrl}?${params.toString()}` : this.apiUrl;
      const response = await axios.get<{
        count: number;
        next: string | null;
        previous: string | null;
        results: SuiviStockPlateforme[];
      }>(url, this.getHeaders());
      
      // Vérifier si les données sont directement dans response.data (tableau)
      // ou dans response.data.results (pagination)
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des suivis de stock:', error);
      if (error.response) {
        console.error('Réponse du serveur:', error.response.status, error.response.data);
      }
      // Retourner une structure par défaut au lieu de propager l'erreur
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }

  /**
   * Récupérer tous les suivis de stock
   */
  async getAll(): Promise<SuiviStockPlateforme[]> {
    try {
      const response = await this.getSuivisStock({});
      return response.results;
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les suivis de stock:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les suivis de stock d'une plateforme spécifique
   */
  async getSuiviStocksByPlateforme(plateformeId: number): Promise<SuiviStockPlateforme[]> {
    try {
      const response = await this.getSuivisStock({ plateforme: plateformeId,  });
      return response.results;
    } catch (error) {
      console.error('Erreur lors de la récupération des suivis de stock par plateforme:', error);
      return [];
    }
  }

  /**
   * Récupérer un suivi de stock par son ID
   */
  async getSuiviStock(id: number): Promise<SuiviStockPlateforme> {
    try {
      const response = await axios.get<SuiviStockPlateforme>(`${this.apiUrl}${id}/`, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du suivi de stock:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau suivi de stock
   */
  async createSuiviStock(suiviStock: CreateSuiviStockPlateforme): Promise<SuiviStockPlateforme> {
    try {
      const response = await axios.post<SuiviStockPlateforme>(this.apiUrl, suiviStock, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du suivi de stock:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un suivi de stock
   */
  async updateSuiviStock(id: number, suiviStock: UpdateSuiviStockPlateforme): Promise<SuiviStockPlateforme> {
    try {
      console.log('📝 Mise à jour du suivi de stock ID:', id);
      console.log('📝 Données envoyées:', JSON.stringify(suiviStock, null, 2));
      console.log('📝 URL:', `${this.apiUrl}${id}/`);
      
      const response = await axios.put<SuiviStockPlateforme>(`${this.apiUrl}${id}/`, suiviStock, this.getHeaders());
      console.log('✅ Réponse du serveur:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour du suivi de stock:', error);
      if (error.response) {
        console.error('❌ Status:', error.response.status);
        console.error('❌ Data:', error.response.data);
        console.error('❌ Headers:', error.response.headers);
      }
      throw error;
    }
  }

  /**
   * Supprimer un suivi de stock
   */
  async deleteSuiviStock(id: number): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
    } catch (error) {
      console.error('Erreur lors de la suppression du suivi de stock:', error);
      throw error;
    }
  }

  /**
   * Marquer des andains comme écoulés (action en lot)
   */
  async marquerEcoule(ids: number[]): Promise<{ message: string; count: number }> {
    try {
      const response = await axios.post<{ message: string; count: number }>(`${this.apiUrl}marquer-ecoule/`, { ids }, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage comme écoulé:', error);
      throw error;
    }
  }

  /**
   * Marquer des andains comme prêts pour vente (action en lot)
   */
  async marquerPretVente(ids: number[]): Promise<{ message: string; count: number }> {
    try {
      const response = await axios.post<{ message: string; count: number }>(`${this.apiUrl}marquer-pret-vente/`, { ids }, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage comme prêt pour vente:', error);
      throw error;
    }
  }

  /**
   * Exporter les données en CSV
   */
  async exporterCSV(ids?: number[]): Promise<Blob> {
    try {
      const body = ids ? { ids } : {};
      const response = await axios.post(`${this.apiUrl}exporter-csv/`, body, {
        ...this.getHeaders(),
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'exportation CSV:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un numéro d'andain est disponible sur une plateforme
   */
  async verifierAndainDisponible(plateforme: number, andainNumero: number, excludeId?: number): Promise<{
    disponible: boolean;
    message?: string;
    existant?: SuiviStockPlateforme;
  }> {
    try {
      const params = new URLSearchParams();
      params.set('plateforme', plateforme.toString());
      params.set('andain_numero', andainNumero.toString());
      
      if (excludeId) {
        params.set('exclude_id', excludeId.toString());
      }

      const url = `${this.apiUrl}verifier-andain/?${params.toString()}`;
      const response = await axios.get<{
        disponible: boolean;
        message?: string;
        existant?: SuiviStockPlateforme;
      }>(url, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'andain:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des stocks par plateforme
   */
  async getStatistiques(plateformeId?: number): Promise<{
    total_andains: number;
    volume_total_initial: number;
    volume_total_restant: number;
    taux_ecoulement_moyen: number;
    repartition_statuts: { [key: string]: number };
    andains_par_mois: { [key: string]: number };
  }> {
    try {
      console.log('getStatistiques appelé avec plateformeId:', plateformeId, 'Type:', typeof plateformeId);
      
      const params = new URLSearchParams();
      if (plateformeId !== undefined && plateformeId !== null && !isNaN(plateformeId)) {
        params.set('plateforme', plateformeId.toString());
        console.log('Paramètre plateforme ajouté:', plateformeId.toString());
      } else {
        console.log('Aucun paramètre plateforme ajouté (valeur:', plateformeId, ')');
      }
      
      const url = params.toString() ? `${this.apiUrl}statistiques/?${params.toString()}` : `${this.apiUrl}statistiques/`;
      console.log('URL finale pour statistiques:', url);
      
      const response = await axios.get<{
        total_andains: number;
        volume_total_initial: number;
        volume_total_restant: number;
        taux_ecoulement_moyen: number;
        repartition_statuts: { [key: string]: number };
        andains_par_mois: { [key: string]: number };
      }>(url, this.getHeaders());
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      if (error.response) {
        console.error('Réponse du serveur:', error.response.status, error.response.data);
      }
      // Retourner des statistiques par défaut au lieu de propager l'erreur
      return {
        total_andains: 0,
        volume_total_initial: 0,
        volume_total_restant: 0,
        taux_ecoulement_moyen: 0,
        repartition_statuts: {},
        andains_par_mois: {}
      };
    }
  }

  /**
   * Récupérer la liste des plateformes
   */
  async getPlateformes(): Promise<Array<{id: number, nom: string, localisation: string}>> {
    try {
      const response = await axios.get<Array<{id: number, nom: string, localisation: string}>>(
        'http://localhost:8000/api/plateformes/', 
        this.getHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des plateformes:', error);
      if (error.response) {
        console.error('Réponse du serveur:', error.response.status, error.response.data);
      }
      return [];
    }
  }
}