import { inject, Injectable } from '@angular/core';
import { Plateforme } from '../models/plateforme';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';



@Injectable({
  providedIn: 'root'
})
export class PlateformeService {
 
  private readonly base = environment.apiUrl;
  private readonly plateformeUrl = `${this.base}plateformes/`;
  constructor() {}

  private apiService = inject(ApiService);

    async getPlateformes(): Promise<Plateforme[]> {
    try {
      const response = await this.apiService.get<Plateforme[]>(this.plateformeUrl);
      //console.log('Réponse API getPlateformes:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getPlateformes:', error);
      throw error;
    }
  }

  async createPlateforme(plateforme: Plateforme): Promise<Plateforme> {
    try {
      const response = await this.apiService.post<Plateforme>(this.plateformeUrl, plateforme);
      return response.data;
    } catch (error) {
      console.error('Erreur dans createPlateforme:', error);
      throw error;
    }
  }

  async updatePlateforme(id: number, plateforme: Plateforme): Promise<Plateforme> {
    try {
      const response = await this.apiService.put<Plateforme>(`${this.plateformeUrl}${id}/`, plateforme);
      return response.data;
    } catch (error) {
      console.error('Erreur dans updatePlateforme:', error);
      throw error;
    }
  }

  async getPlateformeById(id: number): Promise<Plateforme> {
    try {
      const response = await this.apiService.get<Plateforme>(`${this.plateformeUrl}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getPlateformeById:', error);
      throw error;
    }
  }

  async deletePlateforme(id: number): Promise<void> {
    try {
      await this.apiService.delete(`${this.plateformeUrl}${id}/`);
    } catch (error) {
      console.error('Erreur dans deletePlateforme:', error);
      throw error;
    }
  }
}
