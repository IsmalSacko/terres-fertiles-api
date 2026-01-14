import { inject, Injectable } from '@angular/core';

import { StockageMelange } from '../models/stock-melange.model';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class StockageMelangeService {
    // 🔥 Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}stockages-melanges/`;
  private apiService = inject(ApiService);

  // Normalise les objets retournés par l'API (coerce `volume` en number)
  private normalizeStock(stock: any): StockageMelange {
    if (!stock) return stock;
    return {
      ...stock,
      volume: stock.volume !== undefined && stock.volume !== null ? Number(stock.volume) : stock.volume,
    } as StockageMelange;
  }

  async create(stockageMelange: StockageMelange) : Promise<StockageMelange> {
    try {
      const response = await this.apiService.post<StockageMelange>(this.apiUrl, stockageMelange);
      return this.normalizeStock(response.data);
    } catch (error) {
      console.error('Erreur lors de la création de la saisie de vente:', error);
      throw error;
    }
  }

  async getStockagesMelange() : Promise<StockageMelange[]> {
    try {
      const response = await this.apiService.get<StockageMelange[]>(this.apiUrl);
      console.log('Saisies de vente récupérées:', response.data); // Debug
      return (response.data || []).map((s: any) => this.normalizeStock(s));
    } catch (error) {
      console.error('Erreur lors de la récupération des saisies de vente:', error);
      throw error;
    }
  }

  async updateStockageMelange(id: number, data: any) : Promise<StockageMelange> {
    try {
      const response = await this.apiService.put<StockageMelange>(`${this.apiUrl}${id}/`, data);

      return this.normalizeStock(response.data);
      } catch (error) {
      console.error('Erreur lors de la mise à jour de la saisie de vente:', error);
      throw error;
    }
  }

  async getStockageMelangeById(id: number) : Promise<StockageMelange> {
    try {
      const response = await this.apiService.get<StockageMelange>(`${this.apiUrl}${id}/`);
      return this.normalizeStock(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la saisie de vente:', error);
      throw error;
    }
  }

  async deleteStockageMelange(id: number) : Promise<void> {
    try {
      await this.apiService.delete(`${this.apiUrl}${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la saisie de vente:', error);
      throw error;
    }
  }
  async getStockagesMelangeCount(): Promise<number> {
    const stockages = await this.getStockagesMelange();
    return stockages.length;
  }

  
}


