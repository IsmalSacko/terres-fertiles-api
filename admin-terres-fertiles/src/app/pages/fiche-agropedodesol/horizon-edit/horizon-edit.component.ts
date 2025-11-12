import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheHorizon } from '../../../models/fiche-agropedodesol.model';
import { FicheHorizonService } from '../../../services/ficheAgroPedoServcices/fiche-horizon.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/navbar/confirm-dialog.component';

@Component({
  selector: 'app-horizon-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './horizon-edit.component.html',
  styleUrl: './horizon-edit.component.css'
})
export class HorizonEditComponent implements OnInit {
  horizon: FicheHorizon | null = null;
  possibleNoms: readonly string[] = ['H1','H2','H3','H4','H5'];
  loading = false;
  error: string | null = null;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private horizonService: FicheHorizonService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

  async save() {
    if (!this.horizon?.id) return;
    this.saving = true;
    try {
      await this.horizonService.update(this.horizon.id, this.horizon);
      this.snackBar.open('Horizon enregistré', 'Fermer', { duration: 3000 });
      const ficheId = (this.horizon as any)?.fiche;
      if (ficheId) this.router.navigate([`/fiches-agro-pedologiques/${ficheId}`]);
      else this.router.navigate(['/fiches-agro-pedologiques']);
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de l\'enregistrement.';
    }
    this.saving = false;
  }

  cancel() {
    const ficheId = (this.horizon as any)?.fiche;
    if (ficheId) this.router.navigate([`/fiches-agro-pedologiques/${ficheId}`]);
    else this.router.navigate(['/fiches-agro-pedologiques']);
  }

  async delete() {
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
      this.cancel();
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la suppression de l\'horizon.';
    }
  }
}
