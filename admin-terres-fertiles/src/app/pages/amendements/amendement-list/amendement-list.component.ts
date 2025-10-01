import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AmendementOrganiqueService } from '../../../services/amendement-organique.service';
import { AmendementOrganique } from '../../../models/amendement-organique.model';
import { PlateformeService } from '../../../services/plateforme.service';
import { Plateforme } from '../../../models/plateforme';

@Component({
  selector: 'app-amendement-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './amendement-list.component.html',
  styleUrl: './amendement-list.component.css'
})
export class AmendementListComponent implements OnInit {
  amendements: AmendementOrganique[] = [];
  plateformes: Plateforme[] = [];
  loading = true;
  errorMsg = '';

  constructor(
    private amendementService: AmendementOrganiqueService,
    private plateformeService: PlateformeService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMsg = '';
    
    try {
      const [amendementsData, plateformesData] = await Promise.all([
        this.amendementService.getAll(),
        this.plateformeService.getPlateformes()
      ]);
      
      this.amendements = amendementsData;
      this.plateformes = plateformesData;
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      this.errorMsg = 'Erreur lors du chargement des données';
    } finally {
      this.loading = false;
    }
  }

  getPlateformeNom(plateformeId: number | null | undefined): string {
    if (!plateformeId) return 'Aucune plateforme';
    const plateforme = this.plateformes.find(p => p.id === plateformeId);
    return plateforme ? (plateforme.nom || 'Nom non défini') : 'Plateforme inconnue';
  }

  async deleteAmendement(id: number, nom: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'amendement "${nom}" ?`)) {
      try {
        await this.amendementService.delete(id);
        await this.loadData(); // Recharger la liste
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        this.errorMsg = 'Erreur lors de la suppression';
      }
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}