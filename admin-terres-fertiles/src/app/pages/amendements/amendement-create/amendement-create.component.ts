import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { AmendementOrganiqueService } from '../../../services/amendement-organique.service';
import { PlateformeService } from '../../../services/plateforme.service';
import { CreateAmendementOrganique } from '../../../models/amendement-organique.model';
import { Plateforme } from '../../../models/plateforme';

@Component({
  selector: 'app-amendement-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule
  ],
  templateUrl: './amendement-create.component.html',
  styleUrl: './amendement-create.component.css'
})
export class AmendementCreateComponent implements OnInit {
  plateformes: Plateforme[] = [];
  loading = false;
  errorMsg = '';

  // Données du formulaire
  selectedPlateforme: number | null = null;
  fournisseur = '';
  date_reception = new Date();
  commune = 'LYON';
  debut_date_fabrication = new Date();
  volume_disponible = 0;
  localisation = '';
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    private amendementService: AmendementOrganiqueService,
    private plateformeService: PlateformeService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      this.plateformes = await this.plateformeService.getPlateformes();
    } catch (error) {
      console.error('Erreur lors du chargement des plateformes:', error);
      this.errorMsg = 'Erreur lors du chargement des plateformes';
    }
  }

  async createAmendement() {
    if (!this.fournisseur || !this.commune || this.volume_disponible <= 0) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const amendementData: CreateAmendementOrganique = {
        plateforme: this.selectedPlateforme,
        fournisseur: this.fournisseur,
        date_reception: this.formatDate(this.date_reception),
        commune: this.commune,
        debut_date_fabrication: this.formatDate(this.debut_date_fabrication),
        volume_disponible: this.volume_disponible,
        localisation: this.localisation || null,
        latitude: this.latitude,
        longitude: this.longitude
      };

      await this.amendementService.create(amendementData);
      this.router.navigate(['/amendements']);
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      this.errorMsg = error.response?.data?.message || 'Erreur lors de la création de l\'amendement';
    } finally {
      this.loading = false;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goToAmendements() {
    this.router.navigate(['/amendements']);
  }
}