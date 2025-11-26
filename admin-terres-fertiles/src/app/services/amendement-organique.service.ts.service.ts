import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
export interface AmendementOrganique {
  id?: number;
  nom: string;
  fournisseur: string;
  date_reception: string;
  date_semis: string;
  volume_disponible: number;
  localisation: string;
  latitude?: number | null;
  longitude?: number | null;
  palteforme: number;
  responsable: number;
}

@Injectable({
  providedIn: 'root'
})
export class AmendementOrganiqueServiceTsService {
  constructor() { }
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}amendements-organiques/`
  private apiService = inject(ApiService);
  

  async create(amendement: AmendementOrganique): Promise<AmendementOrganique>{
    const response = await this.apiService.post<AmendementOrganique>(this.apiUrl, amendement);
    return response.data;
  }


  async getAll(): Promise<AmendementOrganique[]>{
    const response = await this.apiService.get<AmendementOrganique[]>(this.apiUrl);
    return response.data;
  }
}
