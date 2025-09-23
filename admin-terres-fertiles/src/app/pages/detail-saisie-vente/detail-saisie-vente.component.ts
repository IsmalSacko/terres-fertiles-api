import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaisieventeService } from '../../services/saisievente.service'; 
import { SaisieVente } from '../../models/saisie-vente.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-detail-saisie-vente',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
],
  templateUrl: './detail-saisie-vente.component.html',
  styleUrls: ['./detail-saisie-vente.component.css'] 
})
export class DetailSaisieVenteComponent {

  saisieVente: SaisieVente | null = null;
  loading = true;
  errorMsg = '';

  // Méthode pour Math.abs dans le template
  Math = Math;

  // Astuce : utiliser formatVolumeWithConversion dans le template pour afficher le volume (ex : {{ formatVolumeWithConversion(saisieVente.volume_tonne) }})

  constructor(
    private route: ActivatedRoute,
    private saisieventeService: SaisieventeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.getSaisieVente(id);
    });
  }

  getSaisieVente(id: number): void {
    this.loading = true;
    this.saisieventeService.getSaisieVenteById(id).then(data => {
      this.saisieVente = data;
      this.loading = false;
    }).catch(error => {
      this.errorMsg = 'Erreur lors de la récupération des données';
      this.loading = false;
    });
  }


  /**
   * Convertit le tonnage en volume (m³)
   * Utilise une densité approximative de 1.3 tonnes/m³ pour les matériaux organiques
   * @param tonnage - Le poids en tonnes
   * @returns Le volume en m³ (arrondi à 2 décimales)
   */
  convertTonnageToVolume(tonnage: number): number {
    const densite = 1.3;
    return Math.round((tonnage / densite) * 100) / 100;
  }

  /**
   * Formate l'affichage volume avec conversion automatique
   * @param tonnage - Le poids en tonnes
   * @returns String formaté "X Tonnes (~Y m³)"
   */
  formatVolumeWithConversion(tonnage: number): string {
    if (tonnage == null || isNaN(tonnage)) return '';
    const volume = this.convertTonnageToVolume(tonnage);
    return `${tonnage} Tonnes (~${volume} m³)`;
  }

  // Méthode pour calculer le stock restant après la vente
  calculateStockAfterSale(volumeInitial: number, volumeVendu: number, volumeTonneActuel: number): number {
    if (isNaN(volumeInitial) || isNaN(volumeVendu) || isNaN(volumeTonneActuel)) {
      return 0;
    }
    const volumeTonneActuelM3 = this.convertTonnageToVolume(volumeTonneActuel);
    const stockRestant = volumeInitial - (volumeVendu + volumeTonneActuelM3);
    if (isNaN(stockRestant) || !isFinite(stockRestant)) {
      return 0;
    }
    return Math.round(stockRestant * 100) / 100;
  }

  // Méthode pour déterminer le statut du stock après vente
  getStockStatus(volumeInitial: number, volumeVendu: number, volumeTonneActuel: number): string {
    const stockRestant = this.calculateStockAfterSale(volumeInitial, volumeVendu, volumeTonneActuel);
    if (stockRestant < 0) return 'critical';
    if (stockRestant < 5) return 'low';
    if (stockRestant < 20) return 'medium';
    return 'good';
  }
}
