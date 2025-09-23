import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { ChantierListComponent } from '../chantiers/chantier-list/chantier-list.component';
import { GisementListComponent } from '../gisments/gisement-list/gisement-list.component';
import { ChantierService } from '../../services/chantier.service';
import { GisementService } from '../../services/gisement.service';
import { PlanningService } from '../../services/planning/planning.service';
import { MelangeService } from '../../services/melange.service';
import { SaisieventeService } from '../../services/saisievente.service';
import { ProduitVenteService } from '../../services/produit-vente.service';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(
    private chantierService: ChantierService,
    private gisementService: GisementService,
    private planningService: PlanningService,
    private melangeService: MelangeService,
    private produitVenteService: ProduitVenteService,
    private saisiesVenteService: SaisieventeService,
    private router: Router
  ) {}

chantierActifs: number = 0;
gisements: number = 0;
plannings: number = 0;
melanges: number = 0;
produitVente: number = 0;
saisiesVente: number = 0;
loading: boolean = true;
loadingGlobal: boolean = false;

ngOnInit() {
  this.loadingGlobal = true;
  this.loadAllData();

}

async loadAllData() {
  this.loading = true;
  try {
    await Promise.all([
      this.loadChantierActifs(),
      this.loadGisementCount(),
      this.loadPlanningCount(),
      this.loadMelangeCount(),
      this.loadProduitVenteCount(),
      this.loadSaisiesVenteCount()
      

    ]);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    this.loading = false;
    this.loadingGlobal = false;
  }
}

async loadChantierActifs() {
  const result = await this.chantierService.getChantierActifs();
  this.animateCounter('chantierActifs', result);
}

async loadGisementCount() {
  const result = await this.gisementService.getGisementCount();
  this.animateCounter('gisements', result);
}

async loadPlanningCount() {
  const result = await this.planningService.getPlanningCount();
  this.animateCounter('plannings', result);
}

async loadMelangeCount() {
  const result = await this.melangeService.getMelangeCount();
  this.animateCounter('melanges', result);
}

async loadProduitVenteCount() {
  const result = await this.produitVenteService.getProduitVenteCount();
  console.log('Produits en vente:', result);
  this.animateCounter('produitVente', result);
}

async loadSaisiesVenteCount() {
  const result = await this.saisiesVenteService.getSaisiesVenteCount();
  this.animateCounter('saisiesVente', result);
}

// Animation du compteur pour rendre les statistiques attractives
private animateCounter(property: 'chantierActifs' | 'gisements' | 'plannings' | 'melanges' | 'fichesVente' | 'produitVente' | 'saisiesVente', targetValue: number) {
  const duration = 1500; // 1.5 secondes
  const startTime = Date.now();
  const startValue = 0;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Fonction d'easing pour une animation plus naturelle
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    (this as any)[property] = Math.floor(startValue + (targetValue - startValue) * easeOut);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      (this as any)[property] = targetValue;
    }
  };
  
  requestAnimationFrame(animate);
}
 

}
