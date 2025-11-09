import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { ProduitVenteService, ProduitVente } from '../../services/produit-vente.service';
import { SaisieventeService } from '../../services/saisievente.service';
import { SaisieVente } from '../../models/saisie-vente.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent implements OnInit, AfterViewInit {
  // Services et injections
  private produitService = inject(ProduitVenteService); 
  private venteService = inject(SaisieventeService); 
  private snackBar = inject(MatSnackBar);

  // Données
  produits: ProduitVente[] = [];
  ventes: SaisieVente[] = [];

  // États
  loadingProduits = false;
  loadingVentes = false;

  // KPI agrégés produits (KPI veut dire key performance indicator)
  totalVolumeInitial = 0;
  totalVolumeDisponible = 0;
  totalVolumeVendu = 0;

  // Références canvas
  @ViewChild('doughnutChart') doughnutCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineCanvas?: ElementRef<HTMLCanvasElement>;

  // Instances Chart.js
  private doughnutChart?: Chart;
  private barChart?: Chart;
  private lineChart?: Chart;
   
  displayedColumnsProduits = ['reference_produit', 'fournisseur', 'nom_site', 'volume_initial', 'volume_disponible', 'volume_vendu'];
  displayedColumnsVentes = ['date_vente', 'nom_client', 'produit', 'volume_tonne', 'est_validee'];

  ngOnInit(): void {
    // Enregistrer les éléments Chart.js
    Chart.register(...registerables);
    this.loadAll();
  }

  ngAfterViewInit(): void {
    // Si les données ont été chargées rapidement, on peut déjà dessiner
    this.refreshCharts();
  }

  async loadAll(): Promise<void> {
    await Promise.all([this.loadProduits(), this.loadVentes()]); // Charger en parallèle
    this.refreshCharts();
  }

  // Convertit une valeur en nombre (gère les strings avec espaces insécables)
  toNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(/\u202F/g, ''));
    return isNaN(n) ? 0 : n;
  }

  private async loadProduits(): Promise<void> {
    this.loadingProduits = true;
    try {
      const produits = await this.produitService.getAll();
      this.produits = produits || [];

      // KPI
      let init = 0, disp = 0, vendu = 0;
      for (const p of this.produits) {
        init += this.toNumber(p.volume_initial); // 
        // volume_disponible fourni en string
        disp += this.toNumber(p.volume_disponible);
        vendu += this.toNumber(p.volume_vendu);
      }
      this.totalVolumeInitial = init;
      this.totalVolumeDisponible = disp;
      this.totalVolumeVendu = vendu;
      this.updateDoughnut();
      this.updateBar();
    } catch (e) {
      console.error('Erreur chargement produits:', e);
      this.snackBar.open('Erreur de chargement des produits', 'Fermer', { duration: 4000 });
    } finally {
      this.loadingProduits = false;
    }
  }

  private async loadVentes(): Promise<void> {
    this.loadingVentes = true;
    try {
      const ventes = await this.venteService.getSaisieVentes();
      // Trier par date_vente desc
      this.ventes = (ventes || []).sort((a, b) => new Date(b.date_vente).getTime() - new Date(a.date_vente).getTime());
      this.updateLine();
    } catch (e) {
      console.error('Erreur chargement ventes:', e);
      this.snackBar.open('Erreur de chargement des ventes', 'Fermer', { duration: 4000 });
    } finally {
      this.loadingVentes = false;
    }
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
  }

  formatDate(dateIso: string): string {
    if (!dateIso) return '';
    return new Date(dateIso).toLocaleDateString('fr-FR');
  }

  private refreshCharts(): void {
    this.updateDoughnut();
    this.updateBar();
    this.updateLine();
  }

  private updateDoughnut(): void {
    if (!this.doughnutCanvas) return;
    const data = [this.totalVolumeInitial, this.totalVolumeDisponible, this.totalVolumeVendu];
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Initial', 'Disponible', 'Vendu'],
        datasets: [{ data, backgroundColor: ['#90caf9', '#a5d6a7', '#ffcc80'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    };
    this.doughnutChart?.destroy();
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, config);
  }

  private updateBar(): void {
    if (!this.barCanvas) return;
    const sorted = [...this.produits]
      .sort((a, b) => this.toNumber(b.volume_disponible) - this.toNumber(a.volume_disponible))
      .slice(0, 10);
    const labels = sorted.map(p => p.reference_produit);
    const dataDisponible = sorted.map(p => this.toNumber(p.volume_disponible));
    const dataVendu = sorted.map(p => this.toNumber(p.volume_vendu));
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: { 
        labels, 
        datasets: [
          { label: 'Disponible (m³)', data: dataDisponible, backgroundColor: '#42a5f5' },
          { label: 'Vendu (m³)', data: dataVendu, backgroundColor: '#ffb74d' }
        ] 
      },
      options: { 
        responsive: true, 
        scales: { y: { beginAtZero: true } }, 
        plugins: { legend: { display: true, position: 'bottom' } } 
      }
    };
    this.barChart?.destroy();
    this.barChart = new Chart(this.barCanvas.nativeElement, config);
  }

  private updateLine(): void {
    if (!this.lineCanvas) return;
    const byMonth: Record<string, number> = {};
    for (const v of this.ventes) {
      const d = new Date(v.date_vente);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const t = this.toNumber(v.volume_tonne);
      byMonth[key] = (byMonth[key] || 0) + t;
    }
    const labels = Object.keys(byMonth).sort();
    const data = labels.map(k => byMonth[k]);
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels, datasets: [{ label: 'Ventes (tonnes)', data, borderColor: '#66bb6a', backgroundColor: 'rgba(102,187,106,0.2)', tension: 0.3, fill: true }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    };
    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas.nativeElement, config);
  }
}
