import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
export interface Chantier {
  id: number;
  nom: string;
  maitre_ouvrage: string;
  entreprise_terrassement: string;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  commune: string;
  is_active: boolean;
}

export type ChantierUpdatePayload = Partial<Pick<Chantier, 'localisation' | 'latitude' | 'longitude' | 'commune'>>;

@Injectable({
  providedIn: 'root'
})
export class ChantierService {
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}chantiers/`
  private apiService = inject(ApiService);  
  
  // Méthode pour les token et entête
  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  constructor() { }

  async getAll(): Promise<Chantier[]> {
    const response = await this.apiService.get<Chantier[]>(this.apiUrl);
    return response.data;
  }

  async getById(id: number): Promise<Chantier> {
    const response = await this.apiService.get<Chantier>(`${this.apiUrl}${id}/`);
    return response.data;
  }

  async create(chantier: Chantier): Promise<Chantier> {
    const response = await this.apiService.post<Chantier>(this.apiUrl, chantier);
    return response.data;
  }

  async update(id: number, payload: ChantierUpdatePayload): Promise<Chantier> {
    const response = await this.apiService.patch<Chantier>(`${this.apiUrl}${id}/`, payload);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    
    await this.apiService.delete(`${this.apiUrl}${id}/`);
  }

  async getChantiersByUser(): Promise<Chantier[]> {
    
    const response = await this.apiService.get<Chantier[]>(`${this.apiUrl}user/`);
    return response.data;
  }

  async getChantierActifs(): Promise<number> {
    const chantier = await this.getAll();
    return chantier.filter(c => c.is_active).length;
  }
} 
