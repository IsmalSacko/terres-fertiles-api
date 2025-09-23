import { Injectable } from '@angular/core';
import axios from 'axios';

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

  private apiUrl = 'http://127.0.0.1:8000/api/plateformes/';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  async getAll(): Promise<Plateforme[]>{
    const response = await axios.get<Plateforme[]>(this.apiUrl, this.getHeaders());
    return response.data;
  }
}
