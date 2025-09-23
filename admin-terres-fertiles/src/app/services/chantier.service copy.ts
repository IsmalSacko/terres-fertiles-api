import { Injectable } from '@angular/core';
import axios from 'axios';

export interface Chantier {
  id: number;
  nom: string;
  maitre_ouvrage: string;
  entreprise_terrassement: string;
  localisation: string;
  latitude: number;
  longitude: number;
  commune: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChantierService {
  private apiUrl = 'http://127.0.0.1:8000/api/chantiers/';
  
  // Méthode pour les token et entête
  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  constructor() { }

  async getAll(): Promise<Chantier[]> {
    const response = await axios.get<Chantier[]>(this.apiUrl, this.getHeaders() );
    return response.data;
  }

  async getById(id: number): Promise<Chantier> {
   
    const response = await axios.get<Chantier>(`${this.apiUrl}${id}/`, this.getHeaders());
    return response.data;
  }

  async create(chantier: Chantier): Promise<Chantier> {
    const response = await axios.post<Chantier>(this.apiUrl, chantier, this.getHeaders());
    return response.data;
  }

  async update(id: number, chantier: Chantier): Promise<Chantier> {
   
    const response = await axios.put<Chantier>(`${this.apiUrl}${id}/`, chantier, this.getHeaders());
    return response.data;
  }

  async delete(id: number): Promise<void> {
    
    await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
  }

  async getChantiersByUser(): Promise<Chantier[]> {
    
    const response = await axios.get<Chantier[]>(`${this.apiUrl}user/`, this.getHeaders());
    return response.data;
  }

  async getChantierActifs(): Promise<number> {
    const chantier = await this.getAll();
    return chantier.filter(c => c.is_active).length;
  }
} 
