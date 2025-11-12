import axios from 'axios';
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
  
  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  // 🔁 Récupérer la liste des mélanges
  async getMelanges(): Promise<any[]> {
    const response = await axios.get<any[]>(this.melangesUrl, this.getHeaders());
    return response.data;
  }

  async deletePlanning(id: number): Promise<void> {
    console.log('Appel suppression planning ID:', id);
    await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
    console.log('Suppression terminée pour ID:', id);
  }

  // 🔁 Récupérer tous les plannings
  async getPlannings(): Promise<MelangeModel[]> {
    const response = await axios.get<MelangeModel[]>(this.apiUrl, this.getHeaders());
    return response.data;
  }

  // ➕ Créer un nouveau planning
  async createPlanning(planning: MelangeModel): Promise<MelangeModel> {
    const response = await axios.post<MelangeModel>(this.apiUrl, planning, this.getHeaders());
    return response.data;
  }

  // ✏ Modifier un planning existant
  async updatePlanning(planning: MelangeModel): Promise<MelangeModel> {
    const response = await axios.put<MelangeModel>(`${this.apiUrl}${planning.id}/`, planning, this.getHeaders());
    return response.data;
  }

  async getPlanningCount(): Promise<number> {
    const plannings = await this.getPlannings();
    return plannings.length;
  }
}