import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AmendementOrganiqueService } from '../../../services/amendement-organique.service';
import { PlateformeService } from '../../../services/plateforme.service';
import { AmendementOrganique, CreateAmendementOrganique } from '../../../models/amendement-organique.model';
import { Plateforme } from '../../../models/plateforme';

@Component({
  selector: 'app-amendement-edit',
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
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './amendement-edit.component.html',
  styleUrl: './amendement-edit.component.css'
})
export class AmendementEditComponent implements OnInit {
  plateformes: Plateforme[] = [];
  amendement: AmendementOrganique | null = null;
  loading = false;
  loadingData = true;
  errorMsg = '';
  amendementId: number = 0;

  // Données du formulaire
  selectedPlateforme: number | null = null;
  fournisseur = '';
  nom = '';
  date_reception = new Date();
  commune = '';
  debut_date_fabrication = new Date();
  volume_disponible = 0;
  localisation = '';
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    private amendementService: AmendementOrganiqueService,
    private plateformeService: PlateformeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.amendementId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.amendementId) {
      await this.loadData();
    } else {
      this.errorMsg = 'ID d\'amendement invalide';
      this.loadingData = false;
    }
  }

  async loadData() {
    this.loadingData = true;
    this.errorMsg = '';

    try {
      const [amendementData, plateformesData] = await Promise.all([
        this.amendementService.getById(this.amendementId),
        this.plateformeService.getPlateformes()
      ]);

      this.amendement = amendementData;
      this.plateformes = plateformesData;

      // Remplir le formulaire avec les données existantes
      this.selectedPlateforme = amendementData.plateforme || null;
      this.fournisseur = amendementData.fournisseur;
      this.nom = amendementData.nom;
      this.date_reception = new Date(amendementData.date_reception);
      this.commune = amendementData.commune;
      this.debut_date_fabrication = new Date(amendementData.debut_date_fabrication);
      this.volume_disponible = amendementData.volume_disponible;
      this.localisation = amendementData.localisation || '';
      this.latitude = amendementData.latitude || null;
      this.longitude = amendementData.longitude || null;

    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      this.errorMsg = 'Erreur lors du chargement des données';
    } finally {
      this.loadingData = false;
    }
  }

  async updateAmendement() {
    if (!this.fournisseur || !this.commune || this.volume_disponible <= 0) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const amendementData: Partial<CreateAmendementOrganique> = {
        plateforme: this.selectedPlateforme,
        fournisseur: this.fournisseur,
        nom: this.nom,
        date_reception: this.formatDate(this.date_reception),
        commune: this.commune,
        debut_date_fabrication: this.formatDate(this.debut_date_fabrication),
        volume_disponible: this.volume_disponible,
        localisation: this.localisation || null,
        latitude: this.latitude,
        longitude: this.longitude
      };

      await this.amendementService.update(this.amendementId, amendementData);
      this.router.navigate(['/amendements', this.amendementId]);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      this.errorMsg = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'amendement';
    } finally {
      this.loading = false;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goBack() {
    this.router.navigate(['/amendements', this.amendementId]);
  }
}