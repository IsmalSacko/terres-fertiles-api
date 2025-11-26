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
    const res = await this.apiService.get(this.FICHE_AGRO_URL);
    return res.data;
  }

  async get(id: number): Promise<FicheAgroPedodeSol> {
    const res = await this.apiService.get(`${this.FICHE_AGRO_URL}${id}/`);
    return res.data;
  }

  async create(fiche: Partial<FicheAgroPedodeSol>): Promise<FicheAgroPedodeSol> {
    const res = await this.apiService.post(this.FICHE_AGRO_URL, fiche);
    return res.data;
  }

  async update(id: number, fiche: Partial<FicheAgroPedodeSol>): Promise<FicheAgroPedodeSol> {
    const res = await this.apiService.patch(`${this.FICHE_AGRO_URL}${id}/`, fiche);
    return res.data;
  }

  async delete(id: number): Promise<void> {
    await this.apiService.delete(`${this.FICHE_AGRO_URL}${id}/`);
  }


   async getNextEAP(ville: string): Promise<string> {
    const res = await this.apiService.get<{ next_eap: string }>(`fiche-agropedodesol/next-eap/?ville=${encodeURIComponent(ville)}`);
    return res.data.next_eap;
  }
}