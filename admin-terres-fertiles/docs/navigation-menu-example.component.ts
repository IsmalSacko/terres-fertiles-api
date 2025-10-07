import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <mat-nav-list class="navigation-menu">
      
      <!-- Dashboard Principal -->
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Tableau de Bord</span>
      </a>

      <mat-divider></mat-divider>

      <!-- Gestion des Ressources -->
      <h3 matSubheader>Gestion des Ressources</h3>
      
      <a mat-list-item routerLink="/gisements" routerLinkActive="active">
        <mat-icon matListItemIcon>location_on</mat-icon>
        <span matListItemTitle>Gisements</span>
      </a>

      <a mat-list-item routerLink="/chantiers" routerLinkActive="active">
        <mat-icon matListItemIcon>construction</mat-icon>
        <span matListItemTitle>Chantiers</span>
      </a>

      <a mat-list-item routerLink="/plateformes" routerLinkActive="active">
        <mat-icon matListItemIcon>business</mat-icon>
        <span matListItemTitle>Plateformes</span>
      </a>

      <mat-divider></mat-divider>

      <!-- Production et Mélanges -->
      <h3 matSubheader>Production</h3>
      
      <a mat-list-item routerLink="/melanges" routerLinkActive="active">
        <mat-icon matListItemIcon>science</mat-icon>
        <span matListItemTitle>Mélanges</span>
      </a>

      <a mat-list-item routerLink="/amendements" routerLinkActive="active">
        <mat-icon matListItemIcon>eco</mat-icon>
        <span matListItemTitle>Amendements</span>
      </a>

      <!-- ✨ NOUVEAU MODULE SUIVI STOCK -->
      <mat-expansion-panel class="menu-expansion-panel">
        <mat-expansion-panel-header>
          <mat-panel-title class="expansion-title">
            <mat-icon>inventory</mat-icon>
            <span>Suivi des Stocks</span>
            <mat-chip color="accent" class="new-badge">Nouveau</mat-chip>
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="submenu-content">
          <a mat-list-item routerLink="/suivistock/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de Bord Stock</span>
          </a>
          
          <a mat-list-item routerLink="/suivistock/list" routerLinkActive="active">
            <mat-icon matListItemIcon>view_list</mat-icon>
            <span matListItemTitle>Liste des Andains</span>
          </a>
          
          <a mat-list-item routerLink="/suivistock/create" routerLinkActive="active">
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Nouveau Suivi</span>
          </a>
        </div>
      </mat-expansion-panel>

      <mat-divider></mat-divider>

      <!-- Commerce -->
      <h3 matSubheader>Commerce</h3>
      
      <a mat-list-item routerLink="/produits" routerLinkActive="active">
        <mat-icon matListItemIcon>shopping_cart</mat-icon>
        <span matListItemTitle>Produits de Vente</span>
      </a>

      <a mat-list-item routerLink="/saisies-vente" routerLinkActive="active">
        <mat-icon matListItemIcon>point_of_sale</mat-icon>
        <span matListItemTitle>Saisies de Vente</span>
      </a>

      <mat-divider></mat-divider>

      <!-- Analyses et Planning -->
      <h3 matSubheader>Outils</h3>
      
      <a mat-list-item routerLink="/analyses-laboratoire" routerLinkActive="active">
        <mat-icon matListItemIcon>biotech</mat-icon>
        <span matListItemTitle>Analyses Laboratoire</span>
      </a>

      <a mat-list-item routerLink="/planning" routerLinkActive="active">
        <mat-icon matListItemIcon>event</mat-icon>
        <span matListItemTitle>Planning</span>
      </a>

      <mat-divider></mat-divider>

      <!-- Compte -->
      <h3 matSubheader>Mon Compte</h3>
      
      <a mat-list-item routerLink="/profil" routerLinkActive="active">
        <mat-icon matListItemIcon>person</mat-icon>
        <span matListItemTitle>Mon Profil</span>
      </a>

    </mat-nav-list>
  `,
  styles: [`
    .navigation-menu {
      padding: 0;
    }

    .navigation-menu .mat-mdc-list-item {
      height: 48px;
      transition: background-color 0.2s ease;
    }

    .navigation-menu .mat-mdc-list-item:hover {
      background-color: rgba(0,0,0,0.04);
    }

    .navigation-menu .active {
      background-color: rgba(25, 118, 210, 0.12) !important;
      color: #1976d2 !important;
    }

    .navigation-menu .active mat-icon {
      color: #1976d2 !important;
    }

    /* Expansion Panel pour Suivi Stock */
    .menu-expansion-panel {
      box-shadow: none !important;
      background: transparent !important;
      margin: 0 !important;
    }

    .menu-expansion-panel .mat-expansion-panel-header {
      height: 48px;
      padding: 0 16px;
    }

    .expansion-title {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .expansion-title mat-icon {
      margin: 0;
    }

    .new-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      min-height: 18px;
      line-height: 16px;
      margin-left: auto;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.05);
        opacity: 0.8;
      }
    }

    .submenu-content {
      padding-left: 16px;
      background: rgba(25, 118, 210, 0.04);
    }

    .submenu-content .mat-mdc-list-item {
      height: 44px;
      font-size: 0.9em;
    }

    .submenu-content .mat-mdc-list-item mat-icon {
      color: #666;
      font-size: 20px;
    }

    .submenu-content .active mat-icon {
      color: #1976d2 !important;
    }

    /* Subheaders */
    h3[matSubheader] {
      color: #666;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    /* Dividers */
    mat-divider {
      margin: 8px 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .navigation-menu {
        padding-bottom: 80px; /* Pour le mobile */
      }

      .expansion-title {
        font-size: 14px;
      }

      .new-badge {
        display: none; /* Masquer sur mobile pour économiser l'espace */
      }
    }
  `]
})
export class NavigationMenuComponent {
  constructor() {}
}

// Instructions d'utilisation :
/*
1. Importez ce composant dans votre layout principal
2. Utilisez-le dans votre template :
   <app-navigation-menu></app-navigation-menu>

3. Ou intégrez le template directement dans votre composant de navigation existant

4. Ajustez les routes selon vos besoins spécifiques

5. Personnalisez les styles selon votre charte graphique
*/