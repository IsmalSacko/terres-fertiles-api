import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DocumentGisementComponent } from './pages/gisments/document-gisement/document-gisement.component';
import { GisementDetailComponent } from './pages/gisments/gisement-detail/gisement-detail.component';
import { GisementListComponent } from './pages/gisments/gisement-list/gisement-list.component';
import { MelangeListComponent } from './pages/melanges/melange-list/melange-list.component';
import { MelangeDetailComponent } from './pages/melanges/melange-detail/melange-detail.component';
import { AnalyseLaboratoireListComponent } from './pages/labo/analyse-laboratoire-list/analyse-laboratoire-list.component';
import { AnalyseLaboratoireDetailComponent } from './pages/labo/analyse-laboratoire-detail/analyse-laboratoire-detail.component';
import { LoginComponent } from './pages/compte/login/login.component';
import { GisementCreateComponent } from './pages/gisments/gisement-create/gisement-create.component';
import { ChantierListComponent } from './pages/chantiers/chantier-list/chantier-list.component';
import { ChantierDetailComponent } from './pages/chantiers/chantier-detail/chantier-detail.component';
import { MelangeAmendementListComponent } from './pages/melanges/melange-amendement-list/melange-amendement-list.component.ts.component';
import { AmendementOrganiqueCreateComponent } from './pages/labo/amendement-organique-create/amendement-organique-create.component';
import { RegisterComponent } from './pages/compte/register/register.component';
import { UserProfileComponent } from './pages/compte/user-profile/user-profile.component';
import { ActivateComponent } from './pages/compte/activate/activate.component';
import { ResetPasswordComponent } from './pages/compte/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './pages/compte/auth/reset-password-confirm/reset-password-confirm.component';
import {PlanningComponent} from './pages/planning/planning.component';
import { SaisieVenteComponent } from './pages/saisie-vente/saisie-vente.component';
import { CreateSaisieVenteComponent } from './pages/create-saisie-vente/create-saisie-vente.component';
import { EditSaisieVenteComponent } from './pages/edit-saisie-vente/edit-saisie-vente.component';
import { DetailSaisieVenteComponent } from './pages/detail-saisie-vente/detail-saisie-vente.component';
import { ListPlateformeComponent } from './pages/plateformes/list-plateforme/list-plateforme.component';
import { DetailPlateformeComponent } from './pages/plateformes/detai-plateforme/detail-plateforme.component';
import { EditPlateformeComponent } from './pages/plateformes/edit-plateforme/edit-plateforme.component';
import { CreatePlateformeComponent } from './pages/plateformes/create-plateforme/create-plateforme.component';
import { ProduitVenteListComponent } from './pages/produits/produit-vente-list/produit-vente-list.component';
import { CreateProduitVenteComponent } from './pages/produits/create-produit-vente/create-produit-vente.component';
import { AmendementListComponent } from './pages/amendements/amendement-list/amendement-list.component';
import { AmendementCreateComponent } from './pages/amendements/amendement-create/amendement-create.component';
import { AmendementDetailComponent } from './pages/amendements/amendement-detail/amendement-detail.component';
import { AmendementEditComponent } from './pages/amendements/amendement-edit/amendement-edit.component';
import { ProduitVenteDetailComponent } from './pages/produits/produit-vente-detail/produit-vente-detail.component';

// Import des routes du module de suivi de stock
import { SUIVISTOCK_ROUTES } from './pages/suivistock';


export const routes: Routes = [
  // Route par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Route pour l'authentification utilisateur
  { path: 'login', component: LoginComponent },
  // routes principales
  { path: 'dashboard', component: DashboardComponent },
  { path: 'documents-gisement', component: DocumentGisementComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profil',component: UserProfileComponent },
  { path: 'chantiers', component: ChantierListComponent },
  { path: 'chantiers/new', component: ChantierDetailComponent },
  { path: 'chantiers/:id', component: ChantierDetailComponent },
  { path: 'gisements', component: GisementListComponent },
  { path: 'gisements/new', component: GisementCreateComponent },
  { path: 'gisements/:id', component: GisementDetailComponent },
  // Routes pour les mélanges d'amendements
  { path: 'melanges-amendements', component: MelangeAmendementListComponent },
  { path: 'amendement-organique-create', component: AmendementOrganiqueCreateComponent},

  // Routes pour les mélanges
  { path: 'melanges', component: MelangeListComponent },
  { path: 'melanges/new', component: MelangeDetailComponent },
  { path: 'melanges/:id', component: MelangeDetailComponent },
  // Routes pour les produits de vente
  { path: 'produits', component: ProduitVenteListComponent },
  { path: 'produits/nouveau', component: CreateProduitVenteComponent },
  { path: 'produits/:id', component: ProduitVenteDetailComponent },
  // Routes pour les saisies de vente
  { path: 'saisies-vente', component: SaisieVenteComponent },
  { path: 'saisies-vente/new', component: CreateSaisieVenteComponent },
  { path: 'saisies-vente/edit/:id', component: EditSaisieVenteComponent },

  { path: 'analyses-laboratoire', component: AnalyseLaboratoireListComponent },
  { path: 'analyses-laboratoire/:id', component: AnalyseLaboratoireDetailComponent },

  { path: 'activate/:uid/:token', component: ActivateComponent},
  // Routes pour la réinitialisation du mot de passe
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'reset-password-confirm/:uid/:token', component:ResetPasswordConfirmComponent},
  // Routes pour la planification
  {path: 'planning', component: PlanningComponent},

  { path: 'detail-saisie-vente/:id', component: DetailSaisieVenteComponent },
  // Routes pour les plateformes
  { path: 'plateformes/new', component: CreatePlateformeComponent },
  { path: 'plateformes', component: ListPlateformeComponent },
  { path: 'plateformes/:id', component: DetailPlateformeComponent },
  { path: 'plateformes/edit/:id', component: EditPlateformeComponent },

  // Routes pour les amendements organiques
  { path: 'amendements', component: AmendementListComponent },
  { path: 'amendements/new', component: AmendementCreateComponent },
  { path: 'amendements/:id', component: AmendementDetailComponent },
  { path: 'amendements/:id/edit', component: AmendementEditComponent },

  // Routes pour le module de suivi de stock
  {
    path: 'suivistock',
    children: SUIVISTOCK_ROUTES,
    title: 'Suivi des Stocks'
  },

];
