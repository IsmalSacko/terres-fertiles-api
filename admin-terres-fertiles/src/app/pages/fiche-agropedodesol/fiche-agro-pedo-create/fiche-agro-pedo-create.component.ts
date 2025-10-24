

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FicheAgroPedodeSol } from '../../../models/fiche-agropedodesol.model';
import { FicheAgroService } from '../../../services/ficheAgroPedoServcices/fiche-agro-pedo.service';
// Removed GisementService and Gisement import
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';


@Component({
  selector: 'app-fiche-agro-pedo-create',
 
  templateUrl: './fiche-agro-pedo-create.component.html',
  styleUrls: ['./fiche-agro-pedo-create.component.css'],
  imports: [
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
  ]
})
export class FicheAgroPedoCreateComponent {
goToHorizonCreate() {
    this.router.navigate(['/fiche-agropedodesol/horizon-create']);
}
  fiche: Partial<FicheAgroPedodeSol> = {};
  loading = false;
  success = false;
  error: string | null = null;
  // Removed gisements and gisementLoading properties

  geoLoading = false;

  async geolocaliser() {
    this.geoLoading = true;
    this.error = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        this.fiche.coord_x = position.coords.latitude;
        this.fiche.coord_y = position.coords.longitude;
        // Appel à une API de reverse geocoding pour obtenir la ville
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          this.fiche.ville = data.address?.city || data.address?.town || data.address?.village || '';
        } catch {
          this.fiche.ville = '';
        }
        // Appel au backend pour obtenir le prochain EAP
        if (this.fiche.ville) {
          this.fiche.EAP = await this.FicheAgroService.getNextEAP(this.fiche.ville);
        }
        this.geoLoading = false;
      }, (err) => {
        this.error = "Impossible d'obtenir la position.";
        this.geoLoading = false;
      });
    } else {
      this.error = "La géolocalisation n'est pas supportée.";
      this.geoLoading = false;
    }
  }

  constructor(private FicheAgroService: FicheAgroService, private router: Router) {}

  async ngOnInit() {
    // Removed gisement loading logic
  }

  async save() {
    this.loading = true;
    this.error = null;
    try {
      const result = await this.FicheAgroService.create(this.fiche);
      this.success = true;
      // Navigue vers le formulaire de création d'Horizon avec l'id de la fiche créée
      this.router.navigate(['/fiche-agropedodesol/horizon-create'], { queryParams: { fiche: result.id } });
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la création.';
    }
    this.loading = false;
  }
}
