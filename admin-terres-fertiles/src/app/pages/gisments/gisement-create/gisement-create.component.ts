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
  chantiers: Chantier[] = [];
  selectedChantier: number | null = null;
  
  commune = '';
  periode_terrassement = '';
  volume_terrasse = '';
  materiau = '';
  localisation = '';
  latitude: number | undefined = undefined;
  longitude: number | undefined = undefined;
  type_de_sol = 'limon';
  typeSolOptions = [
    { value: 'limon', viewValue: 'Limon' },
    { value: 'sableux', viewValue: 'Sableux' },
    { value: 'argileux', viewValue: 'Argileux' },
    { value: 'caillouteux', viewValue: 'Caillouteux' },
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
      console.log('chantierId reçu:', chantierId); // Debug
      if (chantierId) {
        // Pré-sélection du chantier correspondant
        const chantierFound = this.chantiers.find(chantier => chantier.id === parseInt(chantierId));
        console.log('chantier trouvé:', chantierFound); // Debug
        if (chantierFound) {
          this.selectedChantier = chantierFound.id;
          
          this.commune = chantierFound.commune || '';
          console.log('selectedChantier défini à:', this.selectedChantier); // Debug
          // Force la détection des changements pour s'assurer que le template se met à jour
          this.cdr.detectChanges();
        }
      }
    } catch (err) {
      this.errorMsg = 'Erreur lors du chargement des chantiers.';
    }
  }

  async createGisement() {
    if (!this.selectedChantier) {
      this.errorMsg = 'Veuillez sélectionner un chantier.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;
    try {
      await this.gisementService.create({
        chantier: this.selectedChantier,
        commune: this.commune,
        periode_terrassement: this.periode_terrassement,
        volume_terrasse: Number(this.volume_terrasse),
        materiau: this.materiau,
        localisation: this.localisation,
        latitude: this.latitude,
        longitude: this.longitude,
        type_de_sol: this.type_de_sol
      });
      this.router.navigate(['/gisements']);
    } catch (err: any) {
      this.errorMsg = err.response?.data?.message || 'Erreur lors de la création du gisement.';
    } finally {
      this.loading = false;
    }
  }
}
