// Exemple d'ajout du module Suivi Stock au menu de navigation
// À intégrer dans votre composant de navigation principal

// 1. Dans votre composant de menu/sidebar
export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  badge?: string;
  color?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Tableau de Bord',
    icon: 'dashboard',
    route: '/dashboard'
  },
  {
    label: 'Gisements',
    icon: 'location_on',
    route: '/gisements'
  },
  {
    label: 'Chantiers',
    icon: 'construction',
    route: '/chantiers'
  },
  {
    label: 'Mélanges',
    icon: 'science',
    route: '/melanges'
  },
  {
    label: 'Plateformes',
    icon: 'business',
    route: '/plateformes'
  },
  
  // ✨ NOUVEAU MENU POUR LE SUIVI DE STOCK
  {
    label: 'Suivi des Stocks',
    icon: 'inventory',
    children: [
      {
        label: 'Tableau de Bord',
        icon: 'dashboard',
        route: '/suivistock/dashboard',
        badge: 'Nouveau',
        color: 'accent'
      },
      {
        label: 'Liste des Andains',
        icon: 'view_list',
        route: '/suivistock/list'
      },
      {
        label: 'Nouveau Suivi',
        icon: 'add_circle',
        route: '/suivistock/create'
      }
    ]
  },
  
  // Ou version simple sans sous-menu
  {
    label: 'Stocks & Andains',
    icon: 'inventory_2',
    route: '/suivistock',
    badge: 'Nouveau',
    color: 'primary'
  },
  
  {
    label: 'Produits',
    icon: 'shopping_cart',
    route: '/produits'
  },
  {
    label: 'Analyses',
    icon: 'biotech',
    route: '/analyses-laboratoire'
  },
  {
    label: 'Planning',
    icon: 'event',
    route: '/planning'
  }
];

// 2. Template HTML pour le menu avec sous-menu
const MENU_TEMPLATE = `
<mat-nav-list>
  <ng-container *ngFor="let item of menuItems">
    
    <!-- Menu avec sous-éléments -->
    <mat-expansion-panel *ngIf="item.children" class="menu-expansion">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon>{{item.icon}}</mat-icon>
          <span>{{item.label}}</span>
          <mat-chip *ngIf="item.badge" 
                   [color]="item.color" 
                   class="menu-badge">
            {{item.badge}}
          </mat-chip>
        </mat-panel-title>
      </mat-expansion-panel-header>
      
      <div class="submenu-content">
        <a mat-list-item 
           *ngFor="let child of item.children"
           [routerLink]="child.route"
           routerLinkActive="active">
          <mat-icon matListItemIcon>{{child.icon}}</mat-icon>
          <span matListItemTitle>{{child.label}}</span>
          <mat-chip *ngIf="child.badge" 
                   [color]="child.color" 
                   matListItemMeta
                   class="submenu-badge">
            {{child.badge}}
          </mat-chip>
        </a>
      </div>
    </mat-expansion-panel>
    
    <!-- Menu simple -->
    <a mat-list-item 
       *ngIf="!item.children"
       [routerLink]="item.route"
       routerLinkActive="active">
      <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
      <span matListItemTitle>{{item.label}}</span>
      <mat-chip *ngIf="item.badge" 
               [color]="item.color" 
               matListItemMeta
               class="menu-badge">
        {{item.badge}}
      </mat-chip>
    </a>
    
  </ng-container>
</mat-nav-list>
`;

// 3. Styles CSS pour le menu
const MENU_STYLES = `
.menu-expansion {
  box-shadow: none !important;
  background: transparent !important;
  margin: 4px 0;
}

.menu-expansion .mat-expansion-panel-header {
  padding: 0 16px;
  height: 48px;
}

.submenu-content {
  padding-left: 16px;
  background: rgba(0,0,0,0.04);
}

.submenu-content a {
  font-size: 0.9em;
  padding-left: 32px;
}

.menu-badge,
.submenu-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  min-height: 18px;
  line-height: 16px;
}

.active {
  background-color: rgba(25, 118, 210, 0.12) !important;
  color: #1976d2 !important;
}

.active mat-icon {
  color: #1976d2 !important;
}

/* Animation pour les badges "Nouveau" */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.menu-badge[color="accent"],
.submenu-badge[color="accent"] {
  animation: pulse 2s infinite;
}
`;

// 4. Utilisation dans votre composant de navigation
/*
@Component({
  selector: 'app-navigation',
  template: MENU_TEMPLATE,
  styles: [MENU_STYLES]
})
export class NavigationComponent {
  menuItems = MENU_ITEMS;
  
  constructor(private router: Router) {}
  
  navigateToSuiviStock(): void {
    this.router.navigate(['/suivistock/dashboard']);
  }
}
*/