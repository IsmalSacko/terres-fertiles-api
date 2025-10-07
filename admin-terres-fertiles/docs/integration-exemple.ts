// Exemple d'intégration dans un menu de navigation
// navigation-menu.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-menu',
  template: `
    <mat-nav-list>
      <!-- Autres éléments de menu existants -->
      <a mat-list-item routerLink="/dashboard">
        <mat-icon>dashboard</mat-icon>
        <span>Tableau de Bord</span>
      </a>
      
      <a mat-list-item routerLink="/gisements">
        <mat-icon>location_on</mat-icon>
        <span>Gisements</span>
      </a>
      
      <a mat-list-item routerLink="/chantiers">
        <mat-icon>construction</mat-icon>
        <span>Chantiers</span>
      </a>
      
      <!-- NOUVEAU MENU POUR LE SUIVI DE STOCK -->
      <mat-expansion-panel class="menu-expansion-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>inventory</mat-icon>
            <span>Suivi des Stocks</span>
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <!-- Sous-menu pour le suivi de stock -->
        <div class="submenu-content">
          <a mat-list-item routerLink="/suivistock/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            <span>Tableau de Bord Stock</span>
          </a>
          
          <a mat-list-item routerLink="/suivistock/list" routerLinkActive="active">
            <mat-icon>list</mat-icon>
            <span>Liste des Andains</span>
          </a>
          
          <a mat-list-item routerLink="/suivistock/create" routerLinkActive="active">
            <mat-icon>add</mat-icon>
            <span>Nouveau Suivi</span>
          </a>
        </div>
      </mat-expansion-panel>
      
      <!-- Ou version simple sans sous-menu -->
      <a mat-list-item routerLink="/suivistock" routerLinkActive="active">
        <mat-icon>inventory</mat-icon>
        <span>Suivi des Stocks</span>
      </a>
      
      <!-- Autres éléments de menu existants -->
      <a mat-list-item routerLink="/melanges">
        <mat-icon>science</mat-icon>
        <span>Mélanges</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .menu-expansion-panel {
      box-shadow: none;
      background: transparent;
    }
    
    .submenu-content {
      padding-left: 20px;
    }
    
    .submenu-content a {
      font-size: 0.9em;
    }
    
    .active {
      background-color: rgba(25, 118, 210, 0.12);
      color: #1976d2;
    }
  `]
})
export class NavigationMenuComponent {
  constructor(private router: Router) {}
  
  // Méthode pour naviguer programmatiquement
  navigateToSuiviStock(): void {
    this.router.navigate(['/suivistock/dashboard']);
  }
}