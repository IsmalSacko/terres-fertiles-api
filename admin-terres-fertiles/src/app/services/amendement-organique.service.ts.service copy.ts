import { Injectable } from '@angular/core';
import axios from 'axios';

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
  private apiUrl = 'http://127.0.0.1:8000/api/amendements-organiques/';

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
