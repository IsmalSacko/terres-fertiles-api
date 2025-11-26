import { environment } from '../../../environments/environment';
import axios from 'axios';
import { Injectable } from '@angular/core';
import { FicheHorizon } from '../../models/fiche-agropedodesol.model';
import { ApiService } from '../api.service';


@Injectable({ providedIn: 'root' })
export class FicheHorizonService {
  constructor(private apiService: ApiService) {}
  private readonly base = environment.apiUrl
  private readonly FICHE_HORIZON_URL = `${this.base}fiches-horizons/`;

  getAll = async (): Promise<FicheHorizon[]> => {
    const res = await this.apiService.get(this.FICHE_HORIZON_URL);
    return res.data;
  };

  get = async (id: number): Promise<FicheHorizon> => {
    const res = await this.apiService.get(`${this.FICHE_HORIZON_URL}${id}/`);
    return res.data;
  };

  create = async (horizon: Partial<FicheHorizon>): Promise<FicheHorizon> => {
    const res = await this.apiService.post(this.FICHE_HORIZON_URL, horizon);
    return res.data;
  };

  update = async (id: number, horizon: Partial<FicheHorizon>): Promise<FicheHorizon> => {
    const res = await this.apiService.patch(`${this.FICHE_HORIZON_URL}${id}/`, horizon);
    return res.data;
  };

  remove = async (id: number): Promise<void> => {
    await this.apiService.delete(`${this.FICHE_HORIZON_URL}${id}/`);
  };
};