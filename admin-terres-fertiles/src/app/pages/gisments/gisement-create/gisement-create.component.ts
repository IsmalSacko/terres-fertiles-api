import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GisementService } from '../../../services/gisement.service';
import { ChantierService, Chantier } from '../../../services/chantier.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gisement-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './gisement-create.component.html',
  styleUrl: './gisement-create.component.css'
})
export class GisementCreateComponent implements OnInit {
[x: string]: any;
  chantiers: Chantier[] = [];
  selectedChantier: number | null = null;
  
  commune = '';
  periode_terrassement = '';
  volume_terrasse = '';
  materiau = '';
  localisation = '';
  latitude: number | undefined = undefined;
  longitude: number | undefined = undefined;
  geolocLoading = false;
  geolocError = '';
  // Affichage demandé côté UI
  type_de_sol = 'naturel';
  environnementOptions = [
    { value: 'naturel', viewValue: 'Naturel' },
    { value: 'remanie', viewValue: 'Remanié' },
    { value: 'anthropique', viewValue: 'Anthropique' },
    { value: 'autre', viewValue: 'Autre' },
  ];
  errorMsg = '';
  loading = false;

  constructor(
    private gisementService: GisementService,
    private chantierService: ChantierService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      this.chantiers = await this.chantierService.getAll();
      // Récupération du chantierId depuis les paramètres de l'URL
      const chantierId = this.route.snapshot.queryParams['chantier'];
    
      if (chantierId) {
        // Pré-sélection du chantier correspondant
        const chantierFound = this.chantiers.find(chantier => chantier.id === parseInt(chantierId));
        if (chantierFound) {
          this.selectedChantier = chantierFound.id;
          this.updateFieldsFromChantier(chantierFound);
          // Force la détection des changements pour s'assurer que le template se met à jour
          this.cdr.detectChanges();
        }
      }
    } catch (err) {
      this.errorMsg = 'Erreur lors du chargement des chantiers.';
    }
  }

  // Méthode pour remplir automatiquement les champs à partir du chantier sélectionné
  onChantierChange() {
    if (this.selectedChantier) {
      const chantier = this.chantiers.find(c => c.id === this.selectedChantier);
      if (chantier) {
        this.updateFieldsFromChantier(chantier);
      }
    } else {
      // Vider les champs si aucun chantier n'est sélectionné
      this.commune = '';
      this.localisation = '';
      this.latitude = undefined;
      this.longitude = undefined;
    }
  }

  // Méthode utilitaire pour mettre à jour les champs à partir d'un chantier
  private updateFieldsFromChantier(chantier: Chantier) {
    this.commune = chantier.commune || '';
    this.localisation = chantier.localisation || '';
    // Préremplir par défaut les coordonnées avec celles du chantier sélectionné
    this.latitude = chantier.latitude ?? undefined;
    this.longitude = chantier.longitude ?? undefined;
  }

  // Récupération de la position actuelle de l'utilisateur pour remplir latitude/longitude
  getCurrentPosition() {
    this.geolocError = '';
    if (!('geolocation' in navigator)) {
      this.geolocError = 'La géolocalisation n\'est pas supportée par ce navigateur.';
      return;
    }
    this.geolocLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude = Number(pos.coords.latitude.toFixed(6));
        this.longitude = Number(pos.coords.longitude.toFixed(6));
        this.geolocLoading = false;
        this.cdr.detectChanges();
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            this.geolocError = 'Permission refusée pour accéder à la localisation.';
            break;
          case err.POSITION_UNAVAILABLE:
            this.geolocError = 'Position indisponible.';
            break;
          case err.TIMEOUT:
            this.geolocError = 'Délai dépassé lors de la récupération de la position.';
            break;
          default:
            this.geolocError = 'Erreur inconnue lors de la géolocalisation.';
        }
        this.geolocLoading = false;
        this.cdr.detectChanges();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async createGisement() {
    if (!this.selectedChantier) {
      this.errorMsg = 'Veuillez sélectionner un chantier.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;
    try {
      // Suppression du mapping temporaire, utilisation directe des valeurs backend
      await this.gisementService.create({
        chantier: this.selectedChantier,
        commune: this.commune,
        periode_terrassement: this.periode_terrassement,
        volume_terrasse: Number(this.volume_terrasse),
        materiau: this.materiau,
        localisation: this.localisation,
        latitude: this.latitude,
        longitude: this.longitude,
        type_de_sol: this.type_de_sol // Utilisation directe
      });
      this.router.navigate(['/gisements']);
    } catch (err: any) {
      // Améliorer l'affichage d'erreur DRF: concaténer les messages de validation par champ
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        try {
          const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
          this.errorMsg = messages || 'Erreur lors de la création du gisement.';
        } catch {
          this.errorMsg = JSON.stringify(data);
        }
      } else {
        this.errorMsg = err?.message || 'Erreur lors de la création du gisement.';
      }
    } finally {
      this.loading = false;
    }
  }
}
