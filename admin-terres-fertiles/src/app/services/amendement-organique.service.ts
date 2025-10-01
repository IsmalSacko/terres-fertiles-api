import { Injectable } from '@angular/core';
import axios from 'axios';
import { AmendementOrganique, CreateAmendementOrganique } from '../models/amendement-organique.model';

@Injectable({
  providedIn: 'root'
})
export class AmendementOrganiqueService {
  private apiUrl = 'http://127.0.0.1:8000/api/amendements-organiques/';
  
  // Méthode pour les token et entête
  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  constructor() { }

  async getAll(): Promise<AmendementOrganique[]> {
    const response = await axios.get<AmendementOrganique[]>(this.apiUrl, this.getHeaders());
    return response.data;
  }

  async getById(id: number): Promise<AmendementOrganique> {
    const response = await axios.get<AmendementOrganique>(`${this.apiUrl}${id}/`, this.getHeaders());
    return response.data;
  }

  async create(amendement: CreateAmendementOrganique): Promise<AmendementOrganique> {
    const response = await axios.post<AmendementOrganique>(this.apiUrl, amendement, this.getHeaders());
    return response.data;
  }

  async update(id: number, amendement: Partial<CreateAmendementOrganique>): Promise<AmendementOrganique> {
    const response = await axios.patch<AmendementOrganique>(`${this.apiUrl}${id}/`, amendement, this.getHeaders());
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await axios.delete(`${this.apiUrl}${id}/`, this.getHeaders());
  }
}