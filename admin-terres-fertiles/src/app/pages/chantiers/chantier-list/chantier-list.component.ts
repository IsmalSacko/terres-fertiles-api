import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chantier-list',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
    MatFormField,
    MatLabel,

  MatFormFieldModule,   // <-- nécessaire pour <mat-form-field>
  MatInputModule,       // <-- nécessaire pour <input matInput>
  MatDatepickerModule,
  MatNativeDateModule,
],
  templateUrl: './chantier-list.component.html',
  styleUrl: './chantier-list.component.css'
})
export class ChantierListComponent implements OnInit, OnDestroy {
  chantiers: Chantier[] = [];
  loadingGlobal = false;
  loading = false;
  errorMsg = '';
  cols = 3; // Default columns
  rowHeight = '200px'; // Default row height

  // filtrage des chantiers
  filters: {
    nom: string;
    date_creation_from: Date | string | null;
    date_creation_to: Date | string | null;
    commune: string;
    maitre_ouvrage: string;
    entreprise_terrassement: string;
  } = {
    nom: '',
    date_creation_from: null,
    date_creation_to: null,
    commune: '',
    maitre_ouvrage: '',
    entreprise_terrassement: ''  
  };
  originalChantiers: Chantier[] = [];

  private destroyed = new Subject<void>();

  constructor(
    private chantierService: ChantierService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.loadChantiers();
    this.observeBreakpoints();

  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
  // Appliquer les filtres aux chantiers affichés quand l'utilisateur clique sur "Filtrer"
   applyFilter() {
    this.chantiers = this.originalChantiers.filter(c => {
      // Date range filter (inclusive)
      const dateFrom = this.filters.date_creation_from ? new Date(this.filters.date_creation_from) : null;
      const dateTo = this.filters.date_creation_to ? new Date(this.filters.date_creation_to) : null;
      let matchesdate_creation = true;
      if (dateFrom || dateTo) {
        const chantierDate = c.date_creation ? new Date(c.date_creation) : null;
        if (!chantierDate) {
          matchesdate_creation = false;
        } else {
          if (dateFrom && dateTo) {
            matchesdate_creation = chantierDate >= dateFrom && chantierDate <= dateTo;
          } else if (dateFrom) {
            matchesdate_creation = chantierDate >= dateFrom;
          } else if (dateTo) {
            matchesdate_creation = chantierDate <= dateTo;
          }
        }
      }

      const matchesNom = this.filters.nom ? c.nom.toLowerCase().includes(this.filters.nom.toLowerCase()) : true;
      const matchesCommune = this.filters.commune ? c.commune.toLowerCase().includes(this.filters.commune.toLowerCase()) : true;
      const matchesMaitreOuvrage = this.filters.maitre_ouvrage ? c.maitre_ouvrage.toLowerCase().includes(this.filters.maitre_ouvrage.toLowerCase()) : true;
      const matchesEntreprise = this.filters.entreprise_terrassement ? c.entreprise_terrassement.toLowerCase().includes(this.filters.entreprise_terrassement.toLowerCase()) : true;

      return matchesdate_creation && matchesNom && matchesCommune && matchesMaitreOuvrage && matchesEntreprise;
    });
}

// Réinitialiser tous les filtres
resetFilter() {
  this.filters = {
    nom: '',
    date_creation_from: null,
    date_creation_to: null,
    commune: '',
    maitre_ouvrage: '',
    entreprise_terrassement: ''
  };
  this.chantiers = [...this.originalChantiers];
}



  async loadChantiers() {
    this.loading = true;
    this.loadingGlobal = true;
    try {
      this.chantiers = await this.chantierService.getAll();
      this.originalChantiers = [...this.chantiers];
        await new Promise(resolve => setTimeout(resolve, 700));
    } catch (err) {
      this.errorMsg = 'Erreur lors du chargement des chantiers.';
      console.error(err);
    } finally {
      this.loading = false;
      this.loadingGlobal = false;
    }
  }

  observeBreakpoints() {
    this.breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait, // ~<600px
        Breakpoints.TabletPortrait,    // ~<900px
        Breakpoints.TabletLandscape, // ~<1200px
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        if (result.matches) {
          if (result.breakpoints[Breakpoints.HandsetPortrait]) {
            this.cols = 1;
          } else if (result.breakpoints[Breakpoints.TabletPortrait]) {
            this.cols = 2;
          } else if (result.breakpoints[Breakpoints.TabletLandscape]) {
             this.cols = 3; // Or adjust for landscape tablets
          }
        } else {
           this.cols = 3; // Default for larger screens
        }
        // Adjust rowHeight if needed based on breakpoints
        if (this.cols === 1) {
           this.rowHeight = '180px'; // Taller cards on mobile
        } else if (this.cols === 2) {
           this.rowHeight = '200px'; // Standard height for tablets
        } else {
           this.rowHeight = '220px'; // Slightly taller for larger cards
        }
      });
  }

  goToDetail(id: number) {
    this.router.navigate(['/chantiers', id], { state: { viewOnly: true } });
  }

  addChantier() {
    this.router.navigate(['/chantiers/new']);
  }

  ajouterGisementAuChantier(chantierId: number) {
    // Navigue vers la page d'ajout de gisement avec l'ID du chantier présélectionné
    this.router.navigate(['/gisements/new'], { 
      queryParams: { chantier: chantierId },
      state: { selectedChantier: chantierId }
    });
  }
  
  editChantier(id: number) {
    
    this.router.navigate(['/chantiers', id]);
  }

  async deleteChantier(id: number) {
    
    if (id) {
      const nom =  this.chantiers.find(c => c.id === id)?.nom || '';
      const result = await Swal.fire({
        title: 'Supprimer le chantier ?',
        text: 'Cette action est irréversible. Voulez-vous vraiment supprimer ce chantier ' + nom + ' ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          await this.chantierService.delete(id);
          this.chantiers = this.chantiers.filter(c => c.id !== id); //
        } catch (err) {
          this.errorMsg = 'Erreur lors de la suppression du chantier.';
          console.error(err);
        }
      }
    }
  }
} 