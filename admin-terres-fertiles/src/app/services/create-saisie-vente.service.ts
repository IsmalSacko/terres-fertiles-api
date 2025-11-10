import { Injectable } from '@angular/core';
import axios from 'axios';
import { CreateSaisieVente, SaisieVenteResponse } from '../models/create-saisie-vente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreateSaisieVenteService {
  private readonly base = environment.apiUrl;
  private apiUrl = `${this.base}saisies-vente/`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  async createSaisieVente(saisieVente: CreateSaisieVente): Promise<SaisieVenteResponse> {
    try {
      console.log('Données envoyées à l\'API:', saisieVente);
      const response = await axios.post<SaisieVenteResponse>(this.apiUrl, saisieVente, this.getHeaders());
      console.log('Réponse de l\'API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la saisie de vente:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }

  async validateSaisieVente(id: number): Promise<SaisieVenteResponse> {
    try {
      const response = await axios.patch<SaisieVenteResponse>(
        `${this.apiUrl}${id}/`, 
        { est_validee: true }, 
        this.getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de la saisie de vente:', error);
      throw error;
    }
  }

  // Méthode pour vérifier la disponibilité du produit
  async checkProductAvailability(produitId: number, volumeDemande: number): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.base}produits/${produitId}/`, 
        this.getHeaders()
      );
      const produit = response.data;
      const volumeDisponible = parseFloat(produit.volume_disponible);
      return volumeDisponible >= volumeDemande;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }

  // Méthode pour récupérer une saisie de vente par ID
  async getSaisieVenteById(id: number): Promise<SaisieVenteResponse> {
    try {
      const response = await axios.get<SaisieVenteResponse>(
        `${this.apiUrl}${id}/`, 
        this.getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la saisie de vente:', error);
      throw error;
    }
  }

  // Méthode pour mettre à jour une saisie de vente
  async updateSaisieVente(id: number, saisieVente: CreateSaisieVente): Promise<SaisieVenteResponse> {
    try {
      console.log('Données envoyées pour mise à jour:', saisieVente);
      const response = await axios.put<SaisieVenteResponse>(
        `${this.apiUrl}${id}/`, 
        saisieVente, 
        this.getHeaders()
      );
      console.log('Réponse de l\'API (mise à jour):', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la saisie de vente:', error);
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
      }
      throw error;
    }
  }
}
