import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { AmendementOrganique, CreateAmendementOrganique } from '../models/amendement-organique.model';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class AmendementOrganiqueService {
  //private apiUrl = 'https://terres-fertiles.ismael-dev.com/api/amendements-organiques/';
    // 🔥 Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}amendements-organiques/`;
  private apiService = inject(ApiService);

  constructor() { }

  async getAll(): Promise<AmendementOrganique[]> {
    const response = await this.apiService.get<AmendementOrganique[]>(this.apiUrl);
    return response.data;
  }

  async getById(id: number): Promise<AmendementOrganique> {
    const response = await this.apiService.get<AmendementOrganique>(`${this.apiUrl}${id}/`);
    return response.data;
  }

  async create(amendement: CreateAmendementOrganique): Promise<AmendementOrganique> {
    const response = await this.apiService.post<AmendementOrganique>(this.apiUrl, amendement);
    return response.data;
  }

  async update(id: number, amendement: Partial<CreateAmendementOrganique>): Promise<AmendementOrganique> {
    const response = await this.apiService.patch<AmendementOrganique>(`${this.apiUrl}${id}/`, amendement);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await this.apiService.delete(`${this.apiUrl}${id}/`);
  }
}