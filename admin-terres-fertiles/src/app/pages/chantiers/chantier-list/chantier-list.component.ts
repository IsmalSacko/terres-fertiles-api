import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

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
    MatTooltipModule
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

  async loadChantiers() {
    this.loading = true;
    this.loadingGlobal = true;
    try {
      this.chantiers = await this.chantierService.getAll();
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