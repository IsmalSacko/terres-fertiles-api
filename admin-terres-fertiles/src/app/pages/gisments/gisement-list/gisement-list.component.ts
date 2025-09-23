import { Component, OnInit } from '@angular/core';
import { GisementService, Gisement } from '../../../services/gisement.service';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { GisementsMapComponent } from '../gisements-map/gisements-map.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";


@Component({
  selector: 'app-gisement-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    GisementsMapComponent,
    MatProgressSpinnerModule
],
  templateUrl: './gisement-list.component.html',
  styleUrl: './gisement-list.component.css'
})
export class GisementListComponent implements OnInit {
  gisements: Gisement[] = [];
  loadingGlobal = false;
  displayedColumns: string[] = ['commune', 'periode_terrassement', 'volume_terrasse', 'materiau', 'localisation', 'actions'];

  constructor(private gisementService: GisementService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.loadingGlobal = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.gisements = await this.gisementService.getAll();
    } catch (err) {
      console.error('Erreur chargement gisements', err);
    } finally {
      this.loadingGlobal = false;
    }
  }

  goToDetail(id: number, mode: 'view' | 'edit') {
    this.router.navigate(['/gisements', id, { mode: mode }]);
  }

  addGisement() {
    // Redirige vers un formulaire d'ajout (à implémenter)
    this.router.navigate(['/gisements', 'new']);
  }

  editGisement(id: number) {
    // This function might become redundant if goToDetail handles both modes
    // Depending on desired workflow, could redirect to goToDetail(id, 'edit')
    // For now, keep as is or remove if goToDetail is the single entry point
  }

  async deleteGisement(id: number) {
    if (confirm('Supprimer ce gisement ?')) {
      await this.gisementService.delete(id);
      this.gisements = this.gisements.filter(g => g.id !== id);
    }
  }

  getGisementCount(): number {
    return this.gisements.length;
  }
}
