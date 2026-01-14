import { Routes } from '@angular/router';
import { DocumentGisementComponent } from './pages/gisments/document-gisement/document-gisement.component';
import { GisementDetailComponent } from './pages/gisments/gisement-detail/gisement-detail.component';
import { GisementListComponent } from './pages/gisments/gisement-list/gisement-list.component';
import { MelangeListComponent } from './pages/melanges/melange-list/melange-list.component';
import { MelangeDetailComponent } from './pages/melanges/melange-detail/melange-detail.component';
import { LoginComponent } from './pages/compte/login/login.component';
import { GisementCreateComponent } from './pages/gisments/gisement-create/gisement-create.component';
import { ChantierListComponent } from './pages/chantiers/chantier-list/chantier-list.component';
import { ChantierDetailComponent } from './pages/chantiers/chantier-detail/chantier-detail.component';
import { MelangeAmendementListComponent } from './pages/melanges/melange-amendement-list/melange-amendement-list.component.ts.component';
import { AmendementCreateComponent } from './pages/amendements/amendement-create/amendement-create.component';
import { RegisterComponent } from './pages/compte/register/register.component';
import { UserProfileComponent } from './pages/compte/user-profile/user-profile.component';
import { ActivateComponent } from './pages/compte/activate/activate.component';
import { ResetPasswordComponent } from './pages/compte/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './pages/compte/auth/reset-password-confirm/reset-password-confirm.component';
import {PlanningComponent} from './pages/planning/planning.component';
import { ListPlateformeComponent } from './pages/plateformes/list-plateforme/list-plateforme.component';
import { DetailPlateformeComponent } from './pages/plateformes/detai-plateforme/detail-plateforme.component';
import { EditPlateformeComponent } from './pages/plateformes/edit-plateforme/edit-plateforme.component';
import { CreatePlateformeComponent } from './pages/plateformes/create-plateforme/create-plateforme.component';
import { ProduitVenteListComponent } from './pages/produits/produit-vente-list/produit-vente-list.component';
import { CreateProduitVenteComponent } from './pages/produits/create-produit-vente/create-produit-vente.component';
import { AmendementListComponent } from './pages/amendements/amendement-list/amendement-list.component';
import { AmendementDetailComponent } from './pages/amendements/amendement-detail/amendement-detail.component';
import { AmendementEditComponent } from './pages/amendements/amendement-edit/amendement-edit.component';
import { ProduitVenteDetailComponent } from './pages/produits/produit-vente-detail/produit-vente-detail.component';
import { ProduitVenteEditComponent } from './pages/produits/produit-vente-edit/produit-vente-edit.component';
import { StockComponent } from './pages/stock/stock.component';

// Import des routes du module de suivi de stock
import { FicheAgroPedoCreateComponent } from './pages/fiche-agropedodesol/fiche-agro-pedo-create/fiche-agro-pedo-create.component';
import { FicheAgroPedoDetailComponent } from './pages/fiche-agropedodesol/fiche-agro-pedo-detail/fiche-agro-pedo-detail.component';
import { FicheAgroPedoEditComponent } from './pages/fiche-agropedodesol/fiche-agro-pedo-edit/fiche-agro-pedo-edit.component';
import { FicheAgroPedoListComponent } from './pages/fiche-agropedodesol/fiche-agro-pedo-list/fiche-agro-pedo-list.component';
import { HorizonCreateComponent } from './pages/fiche-agropedodesol/horizon-create/horizon-create.component';
import { HorizonDetailComponent } from './pages/fiche-agropedodesol/horizon-detail/horizon-detail.component';
import { HorizonEditComponent } from './pages/fiche-agropedodesol/horizon-edit/horizon-edit.component';
import { PhotoCreateComponent } from './pages/fiche-agropedodesol/photo-create/photo-create.component';
import { PhotoDetailComponent } from './pages/fiche-agropedodesol/photo-detail/photo-detail.component';
import { PhotoEditComponent } from './pages/fiche-agropedodesol/photo-edit/photo-edit.component';
import { PhotoListComponent } from './pages/fiche-agropedodesol/photo-list/photo-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { EditComponent } from './pages/stock/edit/edit.component';
import { AjoutComponent } from './pages/stock/ajout/ajout.component';
// SuiviStock (lecture seule)



export const routes: Routes = [
  // Route par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate:[authGuard] },
  // Route pour l'authentification utilisateur
  { path: 'login', component: LoginComponent },
  // routes principales
  { path: 'documents-gisement', component: DocumentGisementComponent, canActivate:[authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'profil',component: UserProfileComponent, canActivate:[authGuard] },
  { path: 'chantiers', component: ChantierListComponent, canActivate:[authGuard] },
  { path: 'chantiers/new', component: ChantierDetailComponent, canActivate:[authGuard] },
  { path: 'chantiers/:id', component: ChantierDetailComponent, canActivate:[authGuard] },
  { path: 'gisements', component: GisementListComponent, canActivate:[authGuard] },
  { path: 'gisements/new', component: GisementCreateComponent, canActivate:[authGuard] },
  { path: 'gisements/:id', component: GisementDetailComponent, canActivate:[authGuard] },
  // Routes pour les mélanges d'amendements
  { path: 'melanges-amendements', component: MelangeAmendementListComponent, canActivate:[authGuard] },
  { path: 'amendement-organique-create', component: AmendementCreateComponent, canActivate:[authGuard] },

  // Routes pour les mélanges
  { path: 'melanges', component: MelangeListComponent, canActivate:[authGuard] },
  { path: 'melanges/new', component: MelangeDetailComponent, canActivate:[authGuard] },
  { path: 'melanges/:id', component: MelangeDetailComponent, canActivate:[authGuard] },
  // Routes pour les produits de vente
  { path: 'produits', component: ProduitVenteListComponent, canActivate:[authGuard] },
  { path: 'produits/nouveau', component: CreateProduitVenteComponent, canActivate:[authGuard] },
  { path: 'produits/edit/:id', component: ProduitVenteEditComponent, canActivate:[authGuard] },
  { path: 'produits/:id', component: ProduitVenteDetailComponent, canActivate:[authGuard] },
 


  // Fiches de renseignement
  { path: 'activate/:uid/:token', component: ActivateComponent},
  // Routes pour la réinitialisation du mot de passe
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'reset-password-confirm/:uid/:token', component:ResetPasswordConfirmComponent},
  // Routes pour la planification
  {path: 'planning', component: PlanningComponent, canActivate:[authGuard]},

  // Routes pour les plateformes
  { path: 'plateformes/new', component: CreatePlateformeComponent, canActivate:[authGuard] },
  { path: 'plateformes', component: ListPlateformeComponent, canActivate:[authGuard] },
  { path: 'plateformes/:id', component: DetailPlateformeComponent, canActivate:[authGuard] },
  { path: 'plateformes/edit/:id', component: EditPlateformeComponent, canActivate:[authGuard] },

  // Routes pour les amendements organiques
  { path: 'amendements', component: AmendementListComponent, canActivate:[authGuard] },
  { path: 'amendements/new', component: AmendementCreateComponent, canActivate:[authGuard] },
  { path: 'amendements/:id', component: AmendementDetailComponent, canActivate:[authGuard] },
  { path: 'amendements/:id/edit', component: AmendementEditComponent, canActivate:[authGuard] },

 // Routes pour les fiches agro-pédologiques
  { path: 'fiches-agro-pedologiques', component: FicheAgroPedoListComponent, canActivate:[authGuard] },
  { path: 'fiches-agro-pedologiques/new', component: FicheAgroPedoCreateComponent, canActivate:[authGuard] },
  { path: 'fiches-agro-pedologiques/:id', component: FicheAgroPedoDetailComponent, canActivate:[authGuard] },
  { path: 'fiches-agro-pedologiques/:id/edit', component: FicheAgroPedoEditComponent, canActivate:[authGuard] },

  // Ajout de la route pour la création d'un horizon
  { path: 'fiche-agropedodesol/horizons', component: FicheAgroPedoListComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/horizon-create', component: HorizonCreateComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/horizon-detail/:id', component: HorizonDetailComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/horizon-edit/:id', component: HorizonEditComponent, canActivate:[authGuard] },

  // Routes pour les photos d'horizon
  { path:'fiche-agropedodesol/photos', component: PhotoListComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/photo-create', component: PhotoCreateComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/photo-detail/:id', component: PhotoDetailComponent, canActivate:[authGuard] },
  { path:'fiche-agropedodesol/photo-edit/:id', component: PhotoEditComponent, canActivate:[authGuard] },
  
  // Suivi des stocks (lecture seule)
  { path: 'suivistock', component: StockComponent, canActivate:[authGuard] },
  { path: 'stock/edit/:id', component: EditComponent, canActivate:[authGuard] },
  { path: 'stock/ajout', component: AjoutComponent, canActivate:[authGuard] },


];
