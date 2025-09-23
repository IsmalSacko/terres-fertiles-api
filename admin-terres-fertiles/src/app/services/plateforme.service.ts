import { Injectable } from '@angular/core';
import axios from 'axios';
import { Plateforme } from '../models/plateforme';



@Injectable({
  providedIn: 'root'
})
export class PlateformeService {
    //private apiUrl = 'http://127.0.0.1:8000/api/produits/';
    private plateformeUrl = 'http://127.0.0.1:8000/api/plateformes/';

  constructor() {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    const headres = { headers: { Authorization: `Token ${token}` } };
  
    return headres;
  }

    async getPlateformes(): Promise<Plateforme[]> {
    try {
      const response = await axios.get<Plateforme[]>(this.plateformeUrl, this.getHeaders());
      //console.log('Réponse API getPlateformes:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getPlateformes:', error);
      throw error;
    }
  }

  async createPlateforme(plateforme: Plateforme): Promise<Plateforme> {
    try {
      const response = await axios.post<Plateforme>(this.plateformeUrl, plateforme, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur dans createPlateforme:', error);
      throw error;
    }
  }

  async updatePlateforme(id: number, plateforme: Plateforme): Promise<Plateforme> {
    try {
      const response = await axios.put<Plateforme>(`${this.plateformeUrl}${id}/`, plateforme, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur dans updatePlateforme:', error);
      throw error;
    }
  }

  async getPlateformeById(id: number): Promise<Plateforme> {
    try {
      const response = await axios.get<Plateforme>(`${this.plateformeUrl}${id}/`, this.getHeaders());
      return response.data;
    } catch (error) {
      console.error('Erreur dans getPlateformeById:', error);
      throw error;
    }
  }

  async deletePlateforme(id: number): Promise<void> {
    try {
      await axios.delete(`${this.plateformeUrl}${id}/`, this.getHeaders());
    } catch (error) {
      console.error('Erreur dans deletePlateforme:', error);
      throw error;
    }
  }
}
