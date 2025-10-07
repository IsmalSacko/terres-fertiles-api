import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { SuiviStockPlateformeService } from '../../../services/suivi-stock-plateforme.service';
import { SuiviStockPlateforme, STATUT_COLORS } from '../../../models/suivi-stock-plateforme.model';

@Component({
  selector: 'app-suivistock-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './suivistock-detail.component.html',
  styleUrls: ['./suivistock-detail.component.css']
})
export class SuivistockDetailComponent implements OnInit {
  
  suiviStock: SuiviStockPlateforme | null = null;
  loading = false;
  statutColors = STATUT_COLORS;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suiviStockService: SuiviStockPlateformeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSuiviStock(+id);
    }
  }

  /**
   * Charger les détails du suivi de stock
   */
  async loadSuiviStock(id: number): Promise<void> {
    this.loading = true;
    
    try {
      this.suiviStock = await this.suiviStockService.getSuiviStock(id);
      this.loading = false;
    } catch (error) {
      console.error('Erreur chargement suivi stock:', error);
      this.snackBar.open('Erreur lors du chargement', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.loading = false;
    }
  }

  /**
   * Naviguer vers l'édition
   */
  editSuiviStock(): void {
    if (this.suiviStock?.id) {
      this.router.navigate(['/suivistock/edit', this.suiviStock.id]);
    }
  }

  /**
   * Supprimer le suivi de stock
   */
  async deleteSuiviStock(): Promise<void> {
    if (this.suiviStock?.id && confirm('Êtes-vous sûr de vouloir supprimer ce suivi de stock ?')) {
      try {
        await this.suiviStockService.deleteSuiviStock(this.suiviStock.id);
        this.snackBar.open('Suivi de stock supprimé', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/suivistock']);
      } catch (error) {
        console.error('Erreur suppression:', error);
        this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Calculer le volume écoulé
   */
  getVolumeEcoule(): number {
    if (!this.suiviStock) return 0;
    return this.suiviStock.volume_initial_m3 - this.suiviStock.volume_restant_m3;
  }

  /**
   * Calculer le taux d'écoulement
   */
  getTauxEcoulement(): number {
    if (!this.suiviStock || this.suiviStock.volume_initial_m3 === 0) return 0;
    return Math.round((this.getVolumeEcoule() / this.suiviStock.volume_initial_m3) * 100);
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatutColor(): string {
    if (!this.suiviStock) return '#6c757d';
    return this.statutColors[this.suiviStock.statut as keyof typeof STATUT_COLORS] || '#6c757d';
  }

  /**
   * Calculer la durée de stockage
   */
  getDureeStockage(): number | null {
    if (!this.suiviStock?.date_mise_en_andains) return null;
    
    const dateDebut = new Date(this.suiviStock.date_mise_en_andains);
    const dateFin = this.suiviStock.date_ecoulement 
      ? new Date(this.suiviStock.date_ecoulement)
      : new Date();
    
    const diffTime = Math.abs(dateFin.getTime() - dateDebut.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}