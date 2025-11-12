import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheHorizon } from '../../../models/fiche-agropedodesol.model';
import { FicheHorizonService } from '../../../services/ficheAgroPedoServcices/fiche-horizon.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/navbar/confirm-dialog.component';

@Component({
  selector: 'app-horizon-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './horizon-detail.component.html',
  styleUrl: './horizon-detail.component.css'
})
export class HorizonDetailComponent implements OnInit {
  horizon: FicheHorizon | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private horizonService: FicheHorizonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Identifiant horizon invalide.';
      return;
    }
    this.loading = true;
    try {
      this.horizon = await this.horizonService.get(id);
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors du chargement.';
    }
    this.loading = false;
  }

  backToFiche() {
    const ficheId = (this.horizon as any)?.fiche;
    if (ficheId) this.router.navigate([`/fiches-agro-pedologiques/${ficheId}`]);
    else this.router.navigate(['/fiches-agro-pedologiques']);
  }

  editHorizon() {
    if (!this.horizon?.id) return;
    this.router.navigate([`/fiche-agropedodesol/horizon-edit/${this.horizon.id}`]);
  }

  async deleteHorizon() {
    if (!this.horizon?.id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Supprimer cet horizon ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        color: 'warn'
      }
    });
    const ok = await ref.afterClosed().toPromise();
    if (!ok) return;
    try {
      await this.horizonService.remove(this.horizon.id);
      this.snackBar.open('Horizon supprimé', 'Fermer', { duration: 3000 });
      this.backToFiche();
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la suppression de l\'horizon.';
    }
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="14">Image non disponible</text></svg>';
  }
}
