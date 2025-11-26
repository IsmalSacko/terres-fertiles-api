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
    const res = await this.apiService.get(this.FICHE_PHOTO_URL);
    return res.data;
  }
  async get(id: number): Promise<FichePhoto> {
    const res = await this.apiService.get(`${this.FICHE_PHOTO_URL}${id}/`);
    return res.data;
  }
  async create(photo: FormData): Promise<FichePhoto> {
    const headers = {  'Content-Type': 'multipart/form-data' };
    const res = await this.apiService.post(this.FICHE_PHOTO_URL, photo, { headers });
    return res.data;
  }
  async update(id: number, photo: Partial<FichePhoto> | FormData): Promise<FichePhoto> {
    const res = await this.apiService.patch(`${this.FICHE_PHOTO_URL}${id}/`, photo);
    return res.data;
  }
  async delete(id: number): Promise<void> {
    await this.apiService.delete(`${this.FICHE_PHOTO_URL}${id}/`);
  }
};