

import axios from 'axios';
import { Injectable } from '@angular/core';
import { FicheHorizon } from '../../models/fiche-agropedodesol.model';
import { ApiService } from '../api.service';


@Injectable({ providedIn: 'root' })
export class FicheHorizonService {
  constructor(private apiService: ApiService) {}
  private FICHE_HORIZON_URL = 'http://localhost:8000/api/fiches-horizons/';

  getAll = async (): Promise<FicheHorizon[]> => {
    const res = await axios.get(this.FICHE_HORIZON_URL, this.apiService.getHeaders());
    return res.data;
  };

  get = async (id: number): Promise<FicheHorizon> => {
    const res = await axios.get(`${this.FICHE_HORIZON_URL}${id}/`, this.apiService.getHeaders());
    return res.data;
  };

  create = async (horizon: Partial<FicheHorizon>): Promise<FicheHorizon> => {
    const res = await axios.post(this.FICHE_HORIZON_URL, horizon, this.apiService.getHeaders());
    return res.data;
  };

  update = async (id: number, horizon: Partial<FicheHorizon>): Promise<FicheHorizon> => {
    const res = await axios.patch(`${this.FICHE_HORIZON_URL}${id}/`, horizon, this.apiService.getHeaders());
    return res.data;
  };

  remove = async (id: number): Promise<void> => {
    await axios.delete(`${this.FICHE_HORIZON_URL}${id}/`, this.apiService.getHeaders());
  };
};