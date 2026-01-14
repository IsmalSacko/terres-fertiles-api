import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { ProduitVenteService, ProduitVente } from '../../services/produit-vente.service';
import { StockageMelangeService } from '../../services/stock.service';
import { MelangeService } from '../../services/melange.service';
import { StockageMelange } from '../../models/stock-melange.model';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from "../../shared/navbar/confirm-dialog.component";

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
  router = inject(Router);
  private stockageMelangeService = inject(StockageMelangeService); 
  private snackBar = inject(MatSnackBar);
  private melangeService = inject(MelangeService);

  // Données
  produits: ProduitVente[] = [];
  stockages: StockageMelange[] = [];
  melangeMap: Record<string, string> = {};

  // États
  loadingProduits = false;
  loadingVentes = false;

  // KPI agrégés (basés sur les stockages)
  totalVolumeStocke = 0; // somme totale des volumes
  totalVolumeMaturation = 0; // état 'maturation'
  totalVolumeVendu = 0; // état 'vendu'
  // KPI produits (conservés pour affichage produits)
  totalVolumeInitial = 0;
  totalVolumeDisponible = 0;
  totalVolumeVenduProduits = 0;

  // Références canvas
  @ViewChild('doughnutChart') doughnutCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineCanvas?: ElementRef<HTMLCanvasElement>;

  // Instances Chart.js
  private doughnutChart?: Chart;
  private barChart?: Chart;
  private lineChart?: Chart;
   
  displayedColumnsProduits = ['reference_produit', 'fournisseur', 'nom_site', 'volume_initial', 'volume_disponible', 'volume_vendu'];
  displayedColumnsVentes = ['date_mise_en_stock', 'melange', 'volume', 'etat_stock'];

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
    // Charger d'abord la liste des mélanges pour disposer des noms, puis les autres données
    await this.loadMelanges();
    await Promise.all([this.loadProduits(), this.loadStockages()]); // Charger en parallèle
    this.refreshCharts();
  }

  private async loadMelanges(): Promise<void> {
    try {
      const melanges: any[] = await this.melangeService.getAll();
      this.melangeMap = {};
      (melanges || []).forEach(m => {
        const id = String(m.id ?? m.pk ?? m._id ?? m.identifier ?? '');
        this.melangeMap[id] = m.nom_melange || m.nom || m.reference_produit || (`Mélange ${id}`);
      });
      console.log('melangeMap:', this.melangeMap);
    } catch (e) {
      console.error('Erreur chargement mélanges:', e);
      this.melangeMap = {};
    }
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
      this.totalVolumeVenduProduits = vendu;
      this.updateDoughnut();
      this.updateBar();
    } catch (e) {
      console.error('Erreur chargement produits:', e);
      this.snackBar.open('Erreur de chargement des produits', 'Fermer', { duration: 4000 });
    } finally {
      this.loadingProduits = false;
    }
  }

  private async loadStockages(): Promise<void> {
    this.loadingVentes = true;
    try {
      const stockages = await this.stockageMelangeService.getStockagesMelange();
      this.stockages = (stockages || []).sort((a, b) => new Date(b.date_mise_en_stock || '').getTime() - new Date(a.date_mise_en_stock || '').getTime());

      // KPI simples
      let total = 0, maturation = 0, vendu = 0;
      for (const s of this.stockages) {
        const v = this.toNumber(s.volume);
        total += v;
        if (s.etat_stock === 'maturation') maturation += v;
        if (s.etat_stock === 'vendu') vendu += v;
      }
      this.totalVolumeStocke = total;
      this.totalVolumeMaturation = maturation;
      this.totalVolumeVendu = vendu;

      this.updateLine();
      this.updateDoughnut();
      this.updateBar();
    } catch (e) {
      console.error('Erreur chargement stockages:', e);
      this.snackBar.open('Erreur de chargement des stockages', 'Fermer', { duration: 4000 });
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
    const data = [this.totalVolumeStocke, this.totalVolumeMaturation, this.totalVolumeVendu];
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Total', 'En maturation', 'Vendu'],
        datasets: [{ data, backgroundColor: ['#90caf9', '#a5d6a7', '#ffcc80'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    };
    this.doughnutChart?.destroy();
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, config);
  }

  private updateBar(): void {
    if (!this.barCanvas) return;
    // Top 10 mélanges par volume stocké — grouper par id et conserver une map id->nom
    const grouped: Record<string, number> = {};
    const nameMap: Record<string, string> = {};
    for (const s of this.stockages) {
      const idKey = s.melange ?? `ID:${s.melange}`;
      const key = String(idKey);
      grouped[key] = (grouped[key] || 0) + this.toNumber(s.volume);
      // prefer explicit melange name returned by API, else try nested object name, else fallback
      if (!nameMap[key]) {
        nameMap[key] = String(s.melange.nom ?? (s.melange && (s.melange.nom ?? s.melange)) ?? key);
      }
    }
    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const labels = sorted.map(([k]) => this.melangeMap[k] || nameMap[k] || k);
    const dataDisponible = sorted.map(([_, v]) => v);
    const dataVendu: number[] = [];
    console.log('Bar chart labels:', labels);
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: { 
        labels, 
        datasets: [
          { label: 'Volume stocké (m³)', data: dataDisponible, backgroundColor: '#42a5f5' }
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
    for (const v of this.stockages) {
      const d = new Date(v.date_mise_en_stock || '');
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const t = this.toNumber(v.volume);
      byMonth[key] = (byMonth[key] || 0) + t;
    }
    const labels = Object.keys(byMonth).sort();
    const data = labels.map(k => byMonth[k]);
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels, datasets: [{ label: 'Mises en stock (m³)', data, borderColor: '#66bb6a', backgroundColor: 'rgba(102,187,106,0.2)', tension: 0.3, fill: true }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    };
    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas.nativeElement, config);
  }
      goToAddStock(): void {
        // Naviguer vers la page d'ajout de stock
        this.router.navigate(['/stock/ajout']);
  }
  async deleteStock(id: any) {
    const ok = window.confirm('Confirmer la suppression de cette mise en stock ?');
    if (!ok) return;
    try {
      await this.stockageMelangeService.deleteStockageMelange(id);
      this.snackBar.open('Mise en stock supprimée', 'Fermer', { duration: 3000 });
      // Recharger la liste
      await this.loadStockages();
      this.refreshCharts();
    } catch (e) {
      console.error('Erreur suppression stockage:', e);
      this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 4000 });
    }
  }
  editStock(id: any) {
    this.router.navigate(['/stock/edit', id]);
  }
}
