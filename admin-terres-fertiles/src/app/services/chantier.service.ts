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
  date_creation: string;
}

export type ChantierUpdatePayload = Partial<Pick<Chantier, 'localisation' | 'latitude' | 'longitude' | 'commune'>>;

@Injectable({
  providedIn: 'root'
})
export class ChantierService {
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}chantiers/`
  private apiService = inject(ApiService);  
  

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

  // Méthode de filtrage des chantiers
  async list(filters: Record<string, any> = {}): Promise<Chantier[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue; // ignore null / undefined / ''
      // Si date range
      if (typeof value === 'object') {
        if (value.after) params.append(`${key}_after`, this.formatDate(value.after));
        if (value.before) params.append(`${key}_before`, this.formatDate(value.before));
      } else {
        params.append(key, String(value));
      }
    }
    const url = params.toString() ? `${this.apiUrl}?${params.toString()}` : this.apiUrl;
    const response = await this.apiService.get<Chantier[]>(url);
    return response.data;
  }

  private formatDate(d: string | Date) {
    const dt = (d instanceof Date) ? d : new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

} 
