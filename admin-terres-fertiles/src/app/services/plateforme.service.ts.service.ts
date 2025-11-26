import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface Plateforme {
  id: number;
  nom: string;
  localisation: string;
  latitude?: number | null;
  longitude?: number | null;
  responsable?: number | null;
  date_creation?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PlateformeServiceTsService {

  constructor() { }

 private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}plateformes/`;
  private apiService = inject(ApiService);

  async getAll(): Promise<Plateforme[]>{
    const response = await this.apiService.get<Plateforme[]>(this.apiUrl);
    return response.data;
  }
}
