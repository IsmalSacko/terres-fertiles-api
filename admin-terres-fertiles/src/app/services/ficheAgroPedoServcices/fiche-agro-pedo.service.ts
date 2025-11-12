import axios from 'axios';
import { Injectable } from '@angular/core';
import { FicheAgroPedodeSol } from '../../models/fiche-agropedodesol.model';
import { ApiService } from '../api.service';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class FicheAgroService {
  private readonly base = environment.apiUrl;
  private readonly FICHE_AGRO_URL = `${this.base}fiches-agro/`;
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
    const url = `${this.base}fiche-agropedodesol/next-eap/?ville=${encodeURIComponent(ville)}`;
    const res = await axios.get(url, this.apiService.getHeaders());
    return res.data.next_eap;
  }
}