import axios from 'axios';
import { Injectable } from '@angular/core';
import { FichePhoto } from '../../models/fiche-agropedodesol.model';
import { ApiService } from '../api.service';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FichePhotoService {
  private readonly base = environment.apiUrl;
  private readonly FICHE_PHOTO_URL = `${this.base}fiches-photos/`;

  constructor(private apiService: ApiService) {}

  async getAll(): Promise<FichePhoto[]> {
    const res = await axios.get(this.FICHE_PHOTO_URL, this.apiService.getHeaders());
    return res.data;
  }
  async get(id: number): Promise<FichePhoto> {
    const res = await axios.get(`${this.FICHE_PHOTO_URL}${id}/`, this.apiService.getHeaders());
    return res.data;
  }
  async create(photo: FormData): Promise<FichePhoto> {
    const headers = { ...this.apiService.getHeaders().headers, 'Content-Type': 'multipart/form-data' };
    const res = await axios.post(this.FICHE_PHOTO_URL, photo, { headers });
    return res.data;
  }
  async update(id: number, photo: Partial<FichePhoto> | FormData): Promise<FichePhoto> {
    const res = await axios.patch(`${this.FICHE_PHOTO_URL}${id}/`, photo, this.apiService.getHeaders());
    return res.data;
  }
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.FICHE_PHOTO_URL}${id}/`, this.apiService.getHeaders());
  }
};