import { inject, Injectable } from '@angular/core';

import { SaisieVente } from '../models/saisie-vente.model';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class SaisieventeService {
    // 🔥 Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}saisies-vente/`;
  private apiService = inject(ApiService);

  async createSaisieVente(saisieVente: SaisieVente) : Promise<SaisieVente> {
    try {
      const response = await this.apiService.post<SaisieVente>(this.apiUrl, saisieVente);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la saisie de vente:', error);
      throw error;
    }
  }

  async getSaisieVentes() : Promise<SaisieVente[]> {
    try {
      const response = await this.apiService.get<SaisieVente[]>(this.apiUrl);
      console.log('Saisies de vente récupérées:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des saisies de vente:', error);
      throw error;
    }
  }

  async updateSaisieVente(id: number, data: any) : Promise<SaisieVente> {
    try {
      const response = await this.apiService.put<SaisieVente>(`${this.apiUrl}/${id}`, data);

      return response.data;
      } catch (error) {
      console.error('Erreur lors de la mise à jour de la saisie de vente:', error);
      throw error;
    }
  }

  async getSaisieVenteById(id: number) : Promise<SaisieVente> {
    try {
      const response = await this.apiService.get<SaisieVente>(`${this.apiUrl}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la saisie de vente:', error);
      throw error;
    }
  }

  async deleteSaisieVente(id: number) : Promise<void> {
    try {
      await this.apiService.delete(`${this.apiUrl}${id}/`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la saisie de vente:', error);
      throw error;
    }
  }
  async getSaisiesVenteCount(): Promise<number> {
    const saisies = await this.getSaisieVentes();
    return saisies.length;
  }
}


