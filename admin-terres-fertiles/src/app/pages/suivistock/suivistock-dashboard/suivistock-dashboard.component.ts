import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { SuiviStockPlateformeService } from '../../../services/suivi-stock-plateforme.service';

interface StatistiquesGlobales {
  total_andains: number;
  volume_total_initial: number;
  volume_total_restant: number;
  taux_ecoulement_moyen: number;
  repartition_statuts: { [key: string]: number };
  andains_par_mois: { [key: string]: number };
}

interface SuiviStockResume {
  id: number;
  reference_suivi: string;
  andain_numero: number;
  plateforme_nom: string;
  volume_initial_m3: number;
  volume_restant_m3: number;
  taux_ecoulement: number;
  statut: string;
  statut_display: string;
  date_creation: string;
  date_ecoulement?: string;
  melange_nom?: string;
}

@Component({
  selector: 'app-suivistock-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './suivistock-dashboard.component.html',
  styleUrl: './suivistock-dashboard.component.css'
})
export class SuivistockDashboardComponent implements OnInit {
  private suiviStockService = inject(SuiviStockPlateformeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Propriétés du composant
  loading = false;
  statistiques: StatistiquesGlobales = {
    total_andains: 0,
    volume_total_initial: 0,
    volume_total_restant: 0,
    taux_ecoulement_moyen: 0,
    repartition_statuts: {},
    andains_par_mois: {}
  };
  recentSuivis: SuiviStockResume[] = [];
  alertes: any[] = [];
  
  // Formulaire de filtres
  filterForm: FormGroup;
  plateformeOptions: any[] = [];

  constructor() {
    this.filterForm = this.fb.group({
      plateforme: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadOptions();
    
    // Écouter les changements de filtre
    this.filterForm.valueChanges.subscribe(() => {
      this.loadDashboardData();
    });
  }

  private async loadDashboardData(): Promise<void> {
    this.loading = true;
    try {
      const plateformeValue = this.filterForm.get('plateforme')?.value;
      console.log('Valeur brute de plateforme:', plateformeValue, 'Type:', typeof plateformeValue);
      
      let plateformeId: number | undefined = undefined;
      if (plateformeValue && plateformeValue !== '') {
        const parsedId = parseInt(plateformeValue, 10);
        if (!isNaN(parsedId)) {
          // Vérifier que la plateforme existe dans nos options
          const plateformeExists = this.plateformeOptions.some(opt => opt.value === parsedId);
          if (plateformeExists) {
            plateformeId = parsedId;
          } else {
            console.warn('Plateforme ID', parsedId, 'n\'existe pas dans les options disponibles');
            // Remettre le formulaire à "Toutes les plateformes"
            this.filterForm.patchValue({ plateforme: '' }, { emitEvent: false });
          }
        }
      }
      console.log('PlateformeId après validation:', plateformeId, 'Type:', typeof plateformeId);
      
      // Charger les statistiques
      try {
        this.statistiques = await this.suiviStockService.getStatistiques(plateformeId);
        console.log('🎯 Statistiques chargées:', this.statistiques);
        console.log('🎯 Type de statistiques:', typeof this.statistiques);
        console.log('🎯 Statistiques détaillées:', JSON.stringify(this.statistiques, null, 2));
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
        console.log('🔧 Utilisation des statistiques par défaut');
        this.statistiques = {
          total_andains: 0,
          volume_total_initial: 0,
          volume_total_restant: 0,
          taux_ecoulement_moyen: 0,
          repartition_statuts: {},
          andains_par_mois: {}
        };
        console.log('🔧 Statistiques par défaut assignées:', this.statistiques);
      }
      
      // Charger les suivis récents
      const response = await this.suiviStockService.getSuivisStock({
        plateforme: plateformeId
      });
      
      console.log('Réponse getSuivisStock:', response);
      console.log('Type de response:', typeof response);
      console.log('response.results:', response?.results);
      console.log('Type de response.results:', typeof response?.results);
      console.log('Est-ce un tableau ?', Array.isArray(response?.results));
      
      if (response && response.results && Array.isArray(response.results)) {
        this.recentSuivis = response.results.slice(0, 10).map(suivi => ({
          id: suivi.id || 0,
          reference_suivi: suivi.reference_suivi || '',
          andain_numero: suivi.andain_numero,
          plateforme_nom: suivi.plateforme_details?.nom || 'N/A',
          volume_initial_m3: suivi.volume_initial_m3,
          volume_restant_m3: suivi.volume_restant_m3,
          taux_ecoulement: this.calculateTauxEcoulement(suivi.volume_initial_m3, suivi.volume_restant_m3),
          statut: suivi.statut || 'en_stock',
          statut_display: suivi.statut_display || 'En Stock',
          date_creation: suivi.date_creation || new Date().toISOString(),
          date_ecoulement: suivi.date_ecoulement || undefined,
          melange_nom: suivi.melange_details?.nom
        }));
      } else {
        console.log('Aucune donnée de suivis reçue ou format invalide:', response);
        this.recentSuivis = [];
      }
      
      // Générer les alertes
      this.generateAlertes();

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  private async loadOptions(): Promise<void> {
    try {
      // Charger les vraies plateformes depuis l'API
      const plateformes = await this.suiviStockService.getPlateformes();
      
      this.plateformeOptions = [
        { value: '', label: 'Toutes les plateformes' }
      ];
      
      if (plateformes && Array.isArray(plateformes)) {
        plateformes.forEach(p => {
          this.plateformeOptions.push({
            value: p.id,
            label: `${p.nom} - ${p.localisation}`
          });
        });
      }
      
      console.log('Plateformes chargées:', this.plateformeOptions);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      // Garder au moins l'option "Toutes les plateformes"
      this.plateformeOptions = [
        { value: '', label: 'Toutes les plateformes' }
      ];
    }
  }

  private generateAlertes(): void {
    this.alertes = [];
    
    if (!this.recentSuivis.length) return;

    // Alerte pour les stocks faibles
    const stocksFaibles = this.recentSuivis.filter(s => 
      s.taux_ecoulement >= 80 && s.statut !== 'ecoule'
    );
    
    if (stocksFaibles.length > 0) {
      this.alertes.push({
        type: 'warning',
        icon: 'warning',
        title: 'Stocks faibles',
        message: `${stocksFaibles.length} andain(s) ont un taux d'écoulement ≥ 80%`,
        action: 'Voir la liste',
        actionFn: () => this.router.navigate(['/suivistock'], { 
          queryParams: { filter: 'stocks_faibles' } 
        })
      });
    }

    // Alerte pour les andains anciens
    const sixMoisAgo = new Date();
    sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 6);
    
    const andainsAnciens = this.recentSuivis.filter(s => {
      const dateCreation = new Date(s.date_creation);
      return dateCreation < sixMoisAgo && s.statut !== 'ecoule';
    });

    if (andainsAnciens.length > 0) {
      this.alertes.push({
        type: 'info',
        icon: 'schedule',
        title: 'Andains anciens',
        message: `${andainsAnciens.length} andain(s) de plus de 6 mois`,
        action: 'Voir la liste',
        actionFn: () => this.router.navigate(['/suivistock'], { 
          queryParams: { filter: 'andains_anciens' } 
        })
      });
    }

    // Alerte pour les andains sans mélange
    const sansMelange = this.recentSuivis.filter(s => !s.melange_nom);
    
    if (sansMelange.length > 0) {
      this.alertes.push({
        type: 'info',
        icon: 'info',
        title: 'Andains sans mélange',
        message: `${sansMelange.length} andain(s) sans mélange assigné`,
        action: 'Voir la liste',
        actionFn: () => this.router.navigate(['/suivistock'], { 
          queryParams: { filter: 'sans_melange' } 
        })
      });
    }
  }

  private calculateTauxEcoulement(initial: number, restant: number): number {
    if (!initial || initial <= 0) return 0;
    const ecoule = Math.max(0, initial - restant);
    return Math.round((ecoule / initial) * 100);
  }

  // Méthodes utilitaires
  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en_stock': '#2196f3',
      'en_cours_ecoulement': '#ff9800',
      'ecoule': '#4caf50',
      'suspendu': '#f44336'
    };
    return colors[statut] || '#757575';
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  // Navigation
  navigateToList(): void {
    this.router.navigate(['/suivistock']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/suivistock/create']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/suivistock', id]);
  }

  // Actions sur les alertes
  dismissAlerte(index: number): void {
    this.alertes.splice(index, 1);
  }

  executeAlerteAction(alerte: any): void {
    if (alerte.actionFn) {
      alerte.actionFn();
    }
  }

  getMaxAndainsParMois(): number {
    if (!this.statistiques?.andains_par_mois) return 1;
    const values = Object.values(this.statistiques.andains_par_mois);
    return Math.max(...values, 1);
  }

  getStatutPercentage(statut: string): number {
    if (!this.statistiques?.repartition_statuts || !this.statistiques?.total_andains) return 0;
    const count = this.statistiques.repartition_statuts[statut] || 0;
    return (count / this.statistiques.total_andains) * 100;
  }

  getMoisPercentage(mois: string): number {
    if (!this.statistiques?.andains_par_mois) return 0;
    const count = this.statistiques.andains_par_mois[mois] || 0;
    const max = this.getMaxAndainsParMois();
    return (count / max) * 100;
  }
}