import { ApiService } from '../api.service';
import { Injectable } from '@angular/core';
import { MelangeModel } from '../../pages/planning/melange.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
    // 🔥 Base dynamique selon dev/prod
  private readonly base = environment.apiUrl;
  private readonly apiUrl = `${this.base}plannings/`;
  private readonly melangesUrl = `${this.base}melanges/`;
  constructor(private api: ApiService) {}

  // 🔁 Récupérer la liste des mélanges
  async getMelanges(): Promise<any[]> {
    const response = await this.api.get<any[]>(this.melangesUrl);
    return response.data;
  }

  async deletePlanning(id: number): Promise<void> {
    console.log('Appel suppression planning ID:', id);
    await this.api.delete(`${this.apiUrl}${id}/`);
    console.log('Suppression terminée pour ID:', id);
  }

  // 🔁 Récupérer tous les plannings
  async getPlannings(): Promise<MelangeModel[]> {
    const response = await this.api.get<MelangeModel[]>(this.apiUrl);
    return response.data;
  }

  // ➕ Créer un nouveau planning
  async createPlanning(planning: MelangeModel): Promise<MelangeModel> {
    const response = await this.api.post<MelangeModel>(this.apiUrl, planning);
    return response.data;
  }

  // ✏ Modifier un planning existant
  async updatePlanning(planning: MelangeModel): Promise<MelangeModel> {
    const response = await this.api.put<MelangeModel>(`${this.apiUrl}${planning.id}/`, planning);
    return response.data;
  }

  async getPlanningCount(): Promise<number> {
    const plannings = await this.getPlannings();
    return plannings.length;
  }
}