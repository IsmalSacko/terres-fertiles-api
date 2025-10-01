import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AmendementOrganiqueService } from '../../../services/amendement-organique.service';
import { PlateformeService } from '../../../services/plateforme.service';
import { AmendementOrganique } from '../../../models/amendement-organique.model';
import { Plateforme } from '../../../models/plateforme';

@Component({
  selector: 'app-amendement-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './amendement-detail.component.html',
  styleUrl: './amendement-detail.component.css'
})
export class AmendementDetailComponent implements OnInit {
  amendement: AmendementOrganique | null = null;
  plateforme: Plateforme | null = null;
  loading = true;
  errorMsg = '';
  amendementId: number = 0;

  constructor(
    private amendementService: AmendementOrganiqueService,
    private plateformeService: PlateformeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.amendementId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.amendementId) {
      await this.loadAmendement();
    } else {
      this.errorMsg = 'ID d\'amendement invalide';
      this.loading = false;
    }
  }

  async loadAmendement() {
    this.loading = true;
    this.errorMsg = '';

    try {
      this.amendement = await this.amendementService.getById(this.amendementId);
      
      if (this.amendement.plateforme) {
        try {
          this.plateforme = await this.plateformeService.getPlateformeById(this.amendement.plateforme);
        } catch (error) {
          console.warn('Erreur lors du chargement de la plateforme:', error);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'amendement:', error);
      this.errorMsg = 'Amendement non trouvé';
    } finally {
      this.loading = false;
    }
  }

  async deleteAmendement() {
    if (this.amendement && confirm(`Êtes-vous sûr de vouloir supprimer l'amendement "${this.amendement.nom}" ?`)) {
      try {
        await this.amendementService.delete(this.amendementId);
        this.router.navigate(['/amendements']);
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        this.errorMsg = 'Erreur lors de la suppression';
      }
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  goBack() {
    this.router.navigate(['/amendements']);
  }
}