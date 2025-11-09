import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
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
  

  // Méthode pour les token et entête
  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }
  async create(amendement: AmendementOrganique): Promise<AmendementOrganique>{
    const response = await axios.post<AmendementOrganique>(this.apiUrl, amendement, this.getHeaders());
    return response.data;
  }


  async getAll(): Promise<AmendementOrganique[]>{
    const response = await axios.get<AmendementOrganique[]>(this.apiUrl, this.getHeaders());
    return response.data;
  }
}
