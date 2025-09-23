import { Injectable } from '@angular/core';
import axios from 'axios';
import { ProduitVente } from './produit-vente.service';

export interface AnalyseLaboratoire {
  id: number;
  produit: number;
  produit_details?: ProduitVente;
  laboratoire: string;
  code_rapport: string;
  date_reception: string;
  date_analyse: string;
  profondeur_prelevement?: string;
  localisation_echantillon?: string;

  // Paramètres physico-chimiques
  ph_eau?: number;
  ph_kcl?: number;
  calcaire_total?: number;
  calcaire_actif?: number;
  conductivite?: number;

  // Matière organique et azote
  matiere_organique?: number;
  azote_total?: number;
  c_n?: number;

  // CEC et saturation
  cec?: number;
  saturation?: number;

  // Granulométrie
  argile?: number;
  limons_fins?: number;
  limons_grossiers?: number;
  sables_fins?: number;
  sables_grossiers?: number;

  // Éléments minéraux
  calcium?: number;
  magnesium?: number;
  potassium?: number;
  phosphore?: number;
  fer?: number;
  cuivre?: number;
  zinc?: number;
  manganese?: number;

  // Paramètres physiques
  densite_apparente?: number;
  porosite_totale?: number;
  porosite_drainage?: number;
  eau_capillaire?: number;
  permeabilite?: number;

  // Autres paramètres
  iam?: number;
  refus_gravier_2mm?: number;
  fichier_pdf?: string;

  commentaires?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyseLaboratoireService {
  private apiUrl = 'http://127.0.0.1:8000/api/analyses-laboratoire/'; // créer une analyse
  private analyseUrl = 'http://127.0.1:8000/api/analyse-pdf-parse/'; // analyser un pdf

  constructor() { }

  async getAll(): Promise<AnalyseLaboratoire[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const response = await axios.get<AnalyseLaboratoire[]>(this.apiUrl, { headers });
    return response.data;
  }

  async getById(id: number): Promise<AnalyseLaboratoire> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const response = await axios.get<AnalyseLaboratoire>(`${this.apiUrl}${id}/`, { headers });
    return response.data;
  }

  async create(analyse: Partial<AnalyseLaboratoire>): Promise<AnalyseLaboratoire> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const response = await axios.post<AnalyseLaboratoire>(this.apiUrl, analyse, { headers });
    return response.data;
  }

  async parsePdf(file: File): Promise<AnalyseLaboratoire> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<AnalyseLaboratoire>(this.analyseUrl, formData, { headers });
    return response.data;
  }

  async update(id: number, analyse: Partial<AnalyseLaboratoire>): Promise<AnalyseLaboratoire> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const response = await axios.put<AnalyseLaboratoire>(`${this.apiUrl}${id}/`, analyse, { headers });
    return response.data;
  }

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    await axios.delete(`${this.apiUrl}${id}/`, { headers });
  }
} 