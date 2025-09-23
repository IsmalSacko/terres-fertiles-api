import { Component } from '@angular/core';
import { PlateformeService } from '../../../services/plateforme.service';
import { Plateforme } from '../../../models/plateforme';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlateformesMapComponent } from "../plateformes-map/plateformes-map.component";
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/navbar/confirm-dialog.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-list-plateforme',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    PlateformesMapComponent,
    RouterModule,
    MatDialogModule,
    MatProgressSpinnerModule
],

  templateUrl: './list-plateforme.component.html',
  styleUrl: './list-plateforme.component.css'
})
export class ListPlateformeComponent {
  plateformes: Plateforme[] = [];
  loadingDelete = false;
  loadingEdit = false;
  loadingGlobal = false;
  loadingPlateformes = false;

  constructor(
    private plateformeService: PlateformeService, 
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadingGlobal = true;
    
    this.loadPlateformes();
  }

  async loadPlateformes() {
    try {
      this.plateformes = await this.plateformeService.getPlateformes();
      console.log('Plateformes chargées:', this.plateformes);
    } catch (error) {
      console.error('Erreur lors du chargement des plateformes:', error);
    } finally {
      this.loadingGlobal = false;
    }
  }

  async deletePlateforme(id: number) {
    const confirm = await this.dialog.open(ConfirmDialogComponent).afterClosed().toPromise();
    if (!confirm) return;
    this.loadingDelete = true;
    this.loadingGlobal = true;
    try {
      await this.plateformeService.deletePlateforme(id);
      this.plateformes = this.plateformes.filter(p => p.id !== id);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.router.navigate(['/plateformes']);
    } catch (error) {
      console.error('Erreur lors de la suppression de la plateforme:', error);
    } finally {
      this.loadingDelete = false;
      this.loadingGlobal = false;
    }
  }

 
  async editPlateforme(id: number): Promise<void> {
    this.loadingEdit = true;
    this.loadingGlobal = true;
    try {
      const plateforme = this.plateformes.find((p: Plateforme) => p.id === id);
      if (plateforme) {
        console.log('Éditer la plateforme:', plateforme);
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.router.navigate(['/plateformes', 'edit', id]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'édition de la plateforme:', error);
    } finally {
      this.loadingEdit = false;
      this.loadingGlobal = false;
    }
  }
  async viewPlateforme(id: number): Promise<void> {
    this.loadingGlobal = true;
    await new Promise(resolve => setTimeout(resolve, 600));
    await this.router.navigate(['/plateformes', id]);
    this.loadingGlobal = false;
  }
}