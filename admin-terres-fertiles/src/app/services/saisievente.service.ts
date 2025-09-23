import { Injectable } from '@angular/core';
import axios from 'axios';
import { SaisieVente } from '../models/saisie-vente.model';
@Injectable({
  providedIn: 'root'
})
export class SaisieventeService {
  private apiUrl = 'http://localhost:8000/api/saisies-vente/';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  async createSaisieVente(saisieVente: SaisieVente) : Promise<SaisieVente> {
    try {
      const response = await axios.post<SaisieVente>(this.apiUrl, saisieVente, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la saisie de vente:', error);
      throw error;
    }
  }

  async getSaisieVentes() : Promise<SaisieVente[]> {
    try {
      const response = await axios.get<SaisieVente[]>(this.apiUrl, this.getHeaders());
      console.log('Saisies de vente récupérées:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des saisies de vente:', error);
      throw error;
    }
  }

  async updateSaisieVente(id: number, data: any) : Promise<SaisieVente> {
    try {
      const response = await axios.put<SaisieVente>(`${this.apiUrl}/${id}`, data, this.getHeaders());

      return response.data;
      } catch (error) {
      console.error('Erreur lors de la mise à jour de la saisie de vente:', error);
      throw error;
    }
  }

  async getSaisieVenteById(id: number) : Promise<SaisieVente> {
    try {
      const response = await axios.get<SaisieVente>(`${this.apiUrl}${id}/`, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la saisie de vente:', error);
      throw error;
    }
  }

  async deleteSaisieVente(id: number) : Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
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


