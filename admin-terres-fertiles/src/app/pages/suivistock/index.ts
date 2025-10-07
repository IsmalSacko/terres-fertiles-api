// Export des composants
export { SuivistockListComponent } from './suivistock-list/suivistock-list.component';
export { SuivistockCreateComponent } from './suivistock-create/suivistock-create.component';
export { SuivistockDetailComponent } from './suivistock-detail/suivistock-detail.component';
export { SuivistockEditComponent } from './suivistock-edit/suivistock-edit.component';
export { SuivistockDashboardComponent } from './suivistock-dashboard/suivistock-dashboard.component';

// Export des routes
export { SUIVISTOCK_ROUTES, SUIVISTOCK_COMPONENTS } from './suivistock.routes';

// Export du service et modèles
export { SuiviStockPlateformeService } from '../../services/suivi-stock-plateforme.service';
export type { 
  SuiviStockPlateforme, 
  CreateSuiviStockPlateforme, 
  UpdateSuiviStockPlateforme 
} from '../../models/suivi-stock-plateforme.model';