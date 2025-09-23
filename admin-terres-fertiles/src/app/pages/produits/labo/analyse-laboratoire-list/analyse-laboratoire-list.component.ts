import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnalyseLaboratoireService, AnalyseLaboratoire } from '../../../../services/analyse-laboratoire.service';

@Component({
  selector: 'app-analyse-laboratoire-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './analyse-laboratoire-list.component.html',
  styleUrl: './analyse-laboratoire-list.component.css'
})
export class AnalyseLaboratoireListComponent implements OnInit {
  analyses: AnalyseLaboratoire[] = [];
  displayedColumns: string[] = [
    'date_analyse',
    'produit',
    'laboratoire',
    'code_rapport',
    'ph_eau',
    'matiere_organique',
    'azote_total',
    'actions'
  ];
  loading = false;
  errorMsg = '';

  constructor(
    private analyseService: AnalyseLaboratoireService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAnalyses();
  }

  async loadAnalyses(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    try {
      this.analyses = await this.analyseService.getAll();
    } catch (err) {
      console.error('Erreur chargement analyses', err);
      this.errorMsg = 'Erreur lors du chargement des analyses';
    } finally {
      this.loading = false;
    }
  }

  goToDetail(id: number) {
    this.router.navigate(['/analyses-laboratoire', id]);
  }

  addAnalyse() {
    this.router.navigate(['/analyses-laboratoire/new']);
  }

  editAnalyse(id: number) {
    this.router.navigate(['/analyses-laboratoire', id]);
  }

  async deleteAnalyse(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      try {
        await this.analyseService.delete(id);
        this.analyses = this.analyses.filter(a => a.id !== id);
      } catch (err) {
        console.error('Erreur suppression analyse', err);
        this.errorMsg = 'Erreur lors de la suppression de l\'analyse';
      }
    }
  }

  getProduitNom(analyse: AnalyseLaboratoire): string {
    return analyse.produit_details?.reference_produit || `Produit #${analyse.produit}`;
  }
}
