import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionModel } from '@angular/cdk/collections';

import { SuiviStockPlateformeService } from '../../../services/suivi-stock-plateforme.service';
import { PlateformeService } from '../../../services/plateforme.service';
import { MelangeService } from '../../../services/melange.service';
import { SuiviStockPlateforme, STATUT_CHOICES, STATUT_COLORS } from '../../../models/suivi-stock-plateforme.model';
import { Plateforme } from '../../../models/plateforme';
import { Melange } from '../../../models/melange.model';

@Component({
  selector: 'app-suivistock-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './suivistock-list.component.html',
  styleUrls: ['./suivistock-list.component.css']
})
export class SuivistockListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'select',
    'andain_numero',
    'reference_suivi',
    'plateforme',
    'melange',
    'volume_initial_m3',
    'volume_restant_m3',
    'volume_ecoule',
    'taux_ecoulement',
    'statut',
    'date_mise_en_culture',
    'actions'
  ];

  dataSource = new MatTableDataSource<SuiviStockPlateforme>([]);
  selection = new SelectionModel<SuiviStockPlateforme>(true, []);
  
  // Données de référence
  plateformes: Plateforme[] = [];
  melanges: Melange[] = [];
  statutChoices = STATUT_CHOICES;
  statutColors = STATUT_COLORS;

  // Filtres
  filters = {
    search: '',
    plateforme: null as number | null,
    melange: null as number | null,
    statut: '',
    date_debut: '',
    date_fin: ''
  };

  // État du composant
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private suiviStockService: SuiviStockPlateformeService,
    private plateformeService: PlateformeService,
    private melangeService: MelangeService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadReferenceData();
      await this.loadSuivisStock();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Charger les données de référence (plateformes, mélanges)
   */
  async loadReferenceData(): Promise<void> {
    try {
      this.plateformes = await this.plateformeService.getPlateformes();
    } catch (error) {
      console.error('Erreur chargement plateformes:', error);
    }

    try {
      // À adapter selon la méthode disponible dans MelangeService
      // this.melanges = await this.melangeService.getMelanges();
      this.melanges = []; // Temporaire
    } catch (error) {
      console.error('Erreur chargement mélanges:', error);
    }
  }

  /**
   * Charger les suivis de stock
   */
  async loadSuivisStock(): Promise<void> {
    this.loading = true;
    
    const filters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, value]) => value !== '' && value !== null)
    );

    try {
      const response = await this.suiviStockService.getSuivisStock(filters);
      
      // Gérer les deux formats de réponse possible
      const results = response?.results || (Array.isArray(response) ? response : []);
      const count = response?.count || results.length;
      
      this.dataSource.data = results;
      this.totalItems = count;
      this.loading = false;
    } catch (error) {
      console.error('Erreur chargement suivis stock:', error);
      this.snackBar.open('Erreur lors du chargement des données', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.loading = false;
    }
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadSuivisStock();
  }

  /**
   * Réinitialiser les filtres
   */
  clearFilters(): void {
    this.filters = {
      search: '',
      plateforme: null,
      melange: null,
      statut: '',
      date_debut: '',
      date_fin: ''
    };
    this.loadSuivisStock();
  }

  /**
   * Gestion de la sélection
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /**
   * Actions en lot
   */
  async marquerEcoule(): Promise<void> {
    const selectedIds = this.selection.selected.map(item => item.id!);
    if (selectedIds.length === 0) {
      this.snackBar.open('Aucun élément sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    try {
      const response = await this.suiviStockService.marquerEcoule(selectedIds);
      this.snackBar.open(response.message, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.selection.clear();
      this.loadSuivisStock();
    } catch (error) {
      console.error('Erreur marquer écoulé:', error);
      this.snackBar.open('Erreur lors de l\'opération', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  async marquerPretVente(): Promise<void> {
    const selectedIds = this.selection.selected.map(item => item.id!);
    if (selectedIds.length === 0) {
      this.snackBar.open('Aucun élément sélectionné', 'Fermer', { duration: 3000 });
      return;
    }

    try {
      const response = await this.suiviStockService.marquerPretVente(selectedIds);
      this.snackBar.open(response.message, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.selection.clear();
      this.loadSuivisStock();
    } catch (error) {
      console.error('Erreur marquer prêt vente:', error);
      this.snackBar.open('Erreur lors de l\'opération', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Exporter en CSV
   */
  async exporterCSV(): Promise<void> {
    const selectedIds = this.selection.selected.length > 0 
      ? this.selection.selected.map(item => item.id!) 
      : undefined;

    try {
      const blob = await this.suiviStockService.exporterCSV(selectedIds);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `suivi_stock_plateforme_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open('Export CSV terminé', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Erreur export CSV:', error);
      this.snackBar.open('Erreur lors de l\'export', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Supprimer un suivi de stock
   */
  async deleteSuiviStock(id: number): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce suivi de stock ?')) {
      try {
        await this.suiviStockService.deleteSuiviStock(id);
        this.snackBar.open('Suivi de stock supprimé', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadSuivisStock();
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
   * Utilitaires d'affichage
   */
  getStatutLabel(statut: string): string {
    const choice = this.statutChoices.find(c => c.value === statut);
    return choice?.label || statut;
  }

  getStatutColor(statut: string): string {
    return this.statutColors[statut as keyof typeof STATUT_COLORS] || '#6c757d';
  }

  calculerVolumeEcoule(suiviStock: SuiviStockPlateforme): number {
    return suiviStock.volume_initial_m3 - suiviStock.volume_restant_m3;
  }

  calculerTauxEcoulement(suiviStock: SuiviStockPlateforme): number {
    if (suiviStock.volume_initial_m3 === 0) return 0;
    return Math.round((this.calculerVolumeEcoule(suiviStock) / suiviStock.volume_initial_m3) * 100);
  }

  getTauxEcoulementColor(taux: number): string {
    if (taux >= 100) return 'green';
    if (taux >= 50) return 'orange';
    return 'red';
  }

}