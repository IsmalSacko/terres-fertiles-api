import { Routes } from '@angular/router';

// Import des composants
import { SuivistockListComponent } from './suivistock-list/suivistock-list.component';
import { SuivistockCreateComponent } from './suivistock-create/suivistock-create.component';
import { SuivistockDetailComponent } from './suivistock-detail/suivistock-detail.component';
import { SuivistockEditComponent } from './suivistock-edit/suivistock-edit.component';
import { SuivistockDashboardComponent } from './suivistock-dashboard/suivistock-dashboard.component';

export const SUIVISTOCK_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: SuivistockDashboardComponent,
    title: 'Tableau de Bord - Suivi des Stocks'
  },
  {
    path: 'list',
    component: SuivistockListComponent,
    title: 'Liste des Suivis de Stock'
  },
  {
    path: 'create',
    component: SuivistockCreateComponent,
    title: 'Nouveau Suivi de Stock'
  },
  {
    path: 'detail/:id',
    component: SuivistockDetailComponent,
    title: 'Détails du Suivi de Stock'
  },
  {
    path: 'edit/:id',
    component: SuivistockEditComponent,
    title: 'Modifier le Suivi de Stock'
  },
  {
    path: ':id',
    component: SuivistockDetailComponent,
    title: 'Détails du Suivi de Stock'
  }
];

// Export des composants pour faciliter l'importation
export const SUIVISTOCK_COMPONENTS = [
  SuivistockListComponent,
  SuivistockCreateComponent,
  SuivistockDetailComponent,
  SuivistockEditComponent,
  SuivistockDashboardComponent
] as const;