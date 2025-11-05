import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaisieVente } from '../../../models/saisie-vente.model';
import { SaisieventeService } from '../../../services/saisievente.service';

@Component({
  selector: 'app-saisie-vente',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    DatePipe, 
    MatCardModule, 
    MatButtonModule,
    MatIconModule, 
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './saisie-vente.component.html',
  styleUrl: './saisie-vente.component.css'
})
export class SaisieVenteComponent implements OnInit {
  // Utilitaire pour vérifier si la plateforme est un objet (et non un id)


  /**
   * Supprime une saisie de vente après confirmation utilisateur
   */
  async onDeleteSaisie(saisie: SaisieVente) {
    const confirmDelete = confirm(`Voulez-vous vraiment supprimer la saisie de vente #${saisie.id} ?`);
    if (!confirmDelete) return;
    try {
      await this.saisieVenteService.deleteSaisieVente(saisie.id);
      this.saisietes = this.saisietes.filter((item: SaisieVente) => item.id !== saisie.id);
    } catch (error) {
      alert('Erreur lors de la suppression de la saisie.');
      console.error(error);
    }
  }
  constructor(private saisieVenteService: SaisieventeService) {}
  saisietes: SaisieVente[] = [];
  loading = false;
  errorMsg = '';

  // Méthode pour Math.abs dans le template
  Math = Math;

  /**
   * Convertit le tonnage en volume (m³)
   * Utilise une densité approximative de 1.3 tonnes/m³ pour les matériaux organiques
   * @param tonnage - Le poids en tonnes
   * @returns Le volume en m³ (arrondi à 2 décimales)
   */
  convertTonnageToVolume(tonnage: number): number {
    const densite = 1.3; // tonnes/m³ (densité approximative pour compost/terre)
    return Math.round((tonnage / densite) * 100) / 100;
  }

  /**
   * Formate l'affichage volume avec conversion automatique
   * @param tonnage - Le poids en tonnes
   * @returns String formaté "X Tonnes (~Y m³)"
   */
  formatVolumeWithConversion(tonnage: number): string {
    const volume = this.convertTonnageToVolume(tonnage);
    return `${tonnage} Tonnes (~${volume} m³)`;
  }

  // Méthode pour calculer le stock restant après la vente
  calculateStockAfterSale(volumeInitial: number, volumeVendu: number, volumeTonneActuel: number): number {
    // Validation des entrées
    if (isNaN(volumeInitial) || isNaN(volumeVendu) || isNaN(volumeTonneActuel)) {
      return 0;
    }
    
    // Supposons que volumeInitial et volumeVendu sont déjà en m³
    // volumeTonneActuel est en tonnes, le convertir en m³
    const volumeTonneActuelM3 = this.convertTonnageToVolume(volumeTonneActuel);
    
    // Calcul : Volume initial (m³) - (Volume déjà vendu (m³) + Volume de cette vente (m³))
    const stockRestant = volumeInitial - (volumeVendu + volumeTonneActuelM3);
    
    // Vérification pour éviter les valeurs aberrantes
    if (isNaN(stockRestant) || !isFinite(stockRestant)) {
      return 0;
    }
    
    return Math.round(stockRestant * 100) / 100; // Arrondi à 2 décimales
  }

  // Méthode pour déterminer le statut du stock après vente
  getStockStatus(volumeInitial: number, volumeVendu: number, volumeTonneActuel: number): string {
    const stockRestant = this.calculateStockAfterSale(volumeInitial, volumeVendu, volumeTonneActuel);
    if (stockRestant < 0) return 'critical'; // Stock négatif (survente)
    if (stockRestant < 5) return 'low'; // Stock faible
    if (stockRestant < 20) return 'medium'; // Stock moyen
    return 'good'; // Stock suffisant
  }

  ngOnInit() {
    this.loadSaisieVentes();
  }

  private async loadSaisieVentes() {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.saisietes = await this.saisieVenteService.getSaisieVentes();
    } catch (error) {
      console.error('Erreur lors du chargement des saisies de vente:', error);
      this.errorMsg = 'Erreur lors du chargement des saisies de vente. Veuillez réessayer.';
    } finally {
      this.loading = false;
    }
  }
}
