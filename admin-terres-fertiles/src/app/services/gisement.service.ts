import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

export interface DocumentGisement {
  id: number;
  gisement: {
    id: number;
    commune: string;
    periode_terrassement: string;
    volume_terrasse: number;
    materiau: string;
    localisation: string;
  };
  nom_fichier: string;
  fichier: string;
  date_ajout: string;
}

export interface Gisement {
  id: number;
  chantier_nom?: string;
  chantier: number | { id: number; [key: string]: any };
  documents: DocumentGisement[];
  nom: string;
  date_creation: string;
  commune: string;
  periode_terrassement: string;
  volume_terrasse: number;
  materiau: string;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  type_de_sol: string;
}

export type PartialGisement = Partial<Gisement>;

@Injectable({
  providedIn: 'root'
})
export class GisementService {
      // 🔥 Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}gisements/`;
  private readonly documentGisementApiUrl = `${this.base}documents-gisements/`; 
  
  constructor() {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  // Cette méthode récupère tous les gisements avec authentification (utilisée pour l'affichage sur la carte)
  async getAllGisementCart(): Promise<Gisement[]> {
    const response = await axios.get<Gisement[]>(this.apiUrl, this.getHeaders());
    return response.data;
  }

  async getAll(): Promise<Gisement[]> {
    const response = await axios.get<Gisement[]>(
      this.apiUrl,
      this.getHeaders()
    );
    return response.data.map(gisement => ({
      ...gisement,
      volume_terrasse: Number(gisement.volume_terrasse)
    }));
  }

  async getByChantierId(chantierId: number): Promise<Gisement[]> {
    const response = await axios.get<Gisement[]>(
      `${this.apiUrl}?chantier=${chantierId}`,
      this.getHeaders()
    );
    return response.data.map(gisement => ({
      ...gisement,
      volume_terrasse: Number(gisement.volume_terrasse)
    }));
  }

  async getById(id: number): Promise<Gisement> {
    const response = await axios.get<Gisement>(
      `${this.apiUrl}${id}/`,
      this.getHeaders()
    );
    return {
      ...response.data,
      volume_terrasse: Number(response.data.volume_terrasse)
    };
  }

  async create(gisement: PartialGisement): Promise<Gisement> {
    const response = await axios.post<Gisement>(
      this.apiUrl,
      gisement,
      this.getHeaders()
    );
    return response.data;
  }

  async update(id: number, gisement: PartialGisement): Promise<Gisement> {
    const response = await axios.put<Gisement>(
      `${this.apiUrl}${id}/`,
      gisement,
      this.getHeaders()
    );
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(
      `${this.apiUrl}${id}/`,
      this.getHeaders()
    );
  }

  // Method to get documents for a specific gisement
  async getDocumentsByGisementId(gisementId: number): Promise<DocumentGisement[]> {
    const response = await axios.get<DocumentGisement[]>(
      `${this.documentGisementApiUrl}?gisement=${gisementId}`, 
      this.getHeaders());
    return response.data;
  }

  async getGisementCount(): Promise<number> {
    const gisements = await this.getAll();
    return gisements.filter(g => g.id).length;
  }
}
