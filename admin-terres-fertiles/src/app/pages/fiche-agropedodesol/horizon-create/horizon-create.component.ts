import { Component, inject, OnInit } from '@angular/core';
import { FicheHorizonService } from '../../../services/ficheAgroPedoServcices/fiche-horizon.service';
import { FicheHorizon } from '../../../models/fiche-agropedodesol.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { FicheAgroService } from '../../../services/ficheAgroPedoServcices/fiche-agro-pedo.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-horizon-create',
  imports:  [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './horizon-create.component.html',
  styleUrls: ['./horizon-create.component.css']
})
export class HorizonCreateComponent implements OnInit {
  // Données du formulaire
  horizon: Partial<FicheHorizon> = {};
  // Noms d'horizons  disponibles (pour sélection)
  nomsDisponibles: readonly string[] = ['H1','H2','H3','H4','H5'];
  humiditeDispo : readonly string[] = ['Sec','Humide', 'Très humide','Noyé', 'Autre' ];
  hydromorphieDispo : readonly String[] = ['0','1','2','3','4','5','NA'];
  htcDispo : readonly String[] = ['0','1','2','3','NA'];
  porositeDispo : readonly String[] = ['0','1','2','3','NA'];
  compaciteDispo : readonly string[] = ['Meuble','Peu compact', 'Assez compact','Compact', 'Autre' ];
  fiches: any[] = [];
  loading = false;
  success = false;
  lastCreatedHorizonId: number | null = null;
  error: string | null = null;

  // services injectés et les autres injections nécessaires
  private horizonService = inject(FicheHorizonService);
  private ficheAgroService = inject(FicheAgroService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {}

    // Au chargement du composant
  ngOnInit() {
    this.loadFiches();
    // Pré-sélection de la fiche via query params (ex: ?fiche=123)
    const ficheParam = this.route.snapshot.queryParamMap.get('fiche');
    if (ficheParam) {
      const ficheId = Number(ficheParam);
      if (!isNaN(ficheId)) {
        this.horizon.fiche = ficheId as any;
      }
    }
  }

 async loadFiches() {
  const res = await this.ficheAgroService.getAll();
  this.fiches = res;
}

  async createHorizon() {
    this.loading = true;
    this.error = null;
    try {
      const createdHorizon = await this.horizonService.create(this.horizon);
      this.success = true;
      // retenir l'ID créé pour possibilité d'ajout de photos
      this.lastCreatedHorizonId = (createdHorizon as any).id || null;
      // garder la fiche sélectionnée pour faciliter l'ajout d'un autre horizon
      const selectedFiche = this.horizon.fiche;
      // reset autres champs mais conserver la fiche
      this.horizon = { fiche: selectedFiche };
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la création.';
    }
    this.loading = false;
  }

  // méthode publique utilisée depuis le template pour naviguer vers l'ajout de photos
  goToAddPhotos(horizonId?: number) {
    if (!horizonId) return;
    this.router.navigate(['/fiche-agropedodesol/photo-create'], { queryParams: { horizon: horizonId } });
  }

}