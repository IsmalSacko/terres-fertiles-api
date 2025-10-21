// ...existing code...
import axios from 'axios';
import { Injectable } from '@angular/core';
import { FicheAgroPedodeSol } from '../../models/fiche-agropedodesol.model';
import { ApiService } from '../api.service';

@Injectable({ providedIn: 'root' })
export class FicheAgroService {
  private FICHE_AGRO_URL = 'http://127.0.0.1:8000/api/fiches-agro/';
  constructor(private apiService: ApiService) {}

  async getAll(): Promise<FicheAgroPedodeSol[]> {
    const res = await axios.get(this.FICHE_AGRO_URL, this.apiService.getHeaders());
    return res.data;
  }

  async get(id: number): Promise<FicheAgroPedodeSol> {
    const res = await axios.get(`${this.FICHE_AGRO_URL}${id}/`, this.apiService.getHeaders());
    return res.data;
  }

  async create(fiche: Partial<FicheAgroPedodeSol>): Promise<FicheAgroPedodeSol> {
    const res = await axios.post(this.FICHE_AGRO_URL, fiche, this.apiService.getHeaders());
    return res.data;
  }

  async update(id: number, fiche: Partial<FicheAgroPedodeSol>): Promise<FicheAgroPedodeSol> {
    const res = await axios.patch(`${this.FICHE_AGRO_URL}${id}/`, fiche, this.apiService.getHeaders());
    return res.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${this.FICHE_AGRO_URL}${id}/`, this.apiService.getHeaders());
  }

  async getNextEAP(ville: string): Promise<string> {
    const url = `http://127.0.0.1:8000/api/fiche-agropedodesol/next-eap/?ville=${encodeURIComponent(ville)}`;
    const res = await axios.get(url, this.apiService.getHeaders());
    return res.data.next_eap;
  }
}