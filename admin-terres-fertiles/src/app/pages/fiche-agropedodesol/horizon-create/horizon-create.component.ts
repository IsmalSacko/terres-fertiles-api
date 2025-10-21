import { Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';

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
  styleUrl: './horizon-create.component.css'
})
export class HorizonCreateComponent implements OnInit {
  horizon: Partial<FicheHorizon> = {};
  fiches: any[] = [];
  loading = false;
  success = false;
  error: string | null = null;
  constructor(
    private horizonService: FicheHorizonService, 
    private ficheAgroService: FicheAgroService,
    private router: Router  
  ) {}

    // Au chargement du composant
  ngOnInit() {
    this.loadFiches();
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
  this.horizon = {};
  this.router.navigate(['/fiche-agropedodesol/photo-create'], { queryParams: { horizon: createdHorizon.id } });
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la création.';
    }
    this.loading = false;
  }

}