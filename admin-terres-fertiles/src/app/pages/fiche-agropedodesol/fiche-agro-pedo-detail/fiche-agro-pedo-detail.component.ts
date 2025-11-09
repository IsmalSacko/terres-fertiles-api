import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/navbar/confirm-dialog.component';

import { FicheAgroPedodeSol, FicheHorizon, FichePhoto } from '../../../models/fiche-agropedodesol.model';
import { FicheAgroService } from '../../../services/ficheAgroPedoServcices/fiche-agro-pedo.service';
import { FicheHorizonService } from '../../../services/ficheAgroPedoServcices/fiche-horizon.service';
import { FichePhotoService } from '../../../services/ficheAgroPedoServcices/fiche-photo-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-fiche-agro-pedo-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, MatProgressBarModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './fiche-agro-pedo-detail.component.html',
  styleUrls: ['./fiche-agro-pedo-detail.component.css']
})
export class FicheAgroPedoDetailComponent implements OnInit {
  fiche: FicheAgroPedodeSol | null = null;
  horizons: FicheHorizon[] = [];
  photos: any[] = [];
  photosByType: Record<string, any[]> = {};
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheService: FicheAgroService,
    private horizonService: FicheHorizonService,
    private photoService: FichePhotoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Identifiant de fiche invalide.';
      return;
    }
    this.loading = true;
    try {
      this.fiche = await this.ficheService.get(id);
      // charger horizons liés (robuste à différentes formes de réponse)
      const allHorizons = await this.horizonService.getAll();
      this.horizons = (allHorizons || []).filter(h => {
        const f = (h as any).fiche;
        if (f == null) return false;
        // cas : fiche est un objet { id: ... }
        if (typeof f === 'object') return +((f as any).id || (f as any)) === +id;
        // cas : fiche est string ou number
        return +f === +id;
      });
      // charger photos liées à la fiche
      const allPhotos = await this.photoService.getAll();
      console.log('All photos from service:', allPhotos?.length, allPhotos);

      // Construire la liste des horizon IDs de la fiche (peut être vide si horizons non trouvés)
  const horizonIds = (this.horizons || []).map(h => +((h as any).id || 0)).filter(x => x > 0);

      // Filtrage robuste : la shape retournée par l'API peut être différente
      this.photos = (allPhotos || []).filter(pRaw => {
        const p = pRaw as any;
        // cas : backend expose directement p.fiche
        if (p.fiche != null) return p.fiche == id;

        // cas : p.horizon est un objet { id, fiche? }
        if (p.horizon && typeof p.horizon === 'object') {
          if ((p.horizon as any).fiche != null) return (p.horizon as any).fiche == id;
          if ((p.horizon as any).id != null) return horizonIds.includes(+((p.horizon as any).id));
        }

        // cas : p.horizon est un id (string ou number)
        if (p.horizon != null) {
          return horizonIds.includes(+p.horizon);
        }

        return false;
      });

      // Fallback: parfois les photos sont embarquées dans l'objet fiche
      if ((!this.photos || this.photos.length === 0) && this.fiche && Array.isArray((this.fiche as any).photos) && (this.fiche as any).photos.length > 0) {
        console.log('Using photos embedded in fiche:', (this.fiche as any).photos.length);
        this.photos = (this.fiche as any).photos;
      }

      // Normaliser l'URL d'image pour affichage (créer imageUrl)
      const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="14">Image non disponible</text></svg>';
      this.photos = (this.photos || []).map(p => {
        let url: string | undefined = (p as any).image || (p as any).imageUrl || '';
        if (url && !/^https?:\/\//.test(url)) {
          // construire URL absolue en se basant sur environment.apiUrl
          if (url.startsWith('/')) url = `${environment.apiUrl}${url}`;
          else if (url.startsWith('media/')) url = `${environment.apiUrl}/${url}`;
          else url = `${environment.apiUrl}/media/${url}`;
        }
        return { ...p, imageUrl: url || placeholder } as any;
      });

      console.log('Fiche photos loaded:', this.photos.length, this.photos);
      // classer par type pour le layout imprimable
      this.photosByType = {
        environnement: this.photos.filter(p => p.type_photo === 'environnement'),
        profil: this.photos.filter(p => p.type_photo === 'profil'),
        horizon: this.photos.filter(p => p.type_photo === 'horizon'),
        sondage: this.photos.filter(p => p.type_photo === 'sondage'),
        autre: this.photos.filter(p => p.type_photo === 'autre')
      };
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors du chargement.';
    }
    this.loading = false;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    // fallback placeholder (you can replace with a local asset path)
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="14">Image non disponible</text></svg>';
  }

  getFirstPhotoForHorizon(horizonId?: number): string | null {
    if (!horizonId) return null;
    const p = (this.photos || []).find(x => {
      const xx = x as any;
      if (xx.horizon == null) return false;
      if (typeof xx.horizon === 'object') return +xx.horizon.id === +horizonId || +xx.horizon === +horizonId;
      return +xx.horizon === +horizonId || +xx.horizonId === +horizonId;
    }) as any;
    return p ? (p.imageUrl || p.image || null) : null;
  }

  goToEdit() {
    if (!this.fiche?.id) return;
    this.router.navigate([`/fiches-agro-pedologiques/${this.fiche.id}/edit`]);
  }

  goToHorizonDetail(horizonId?: number) {
    if (!horizonId) return;
    this.router.navigate([`/fiche-agropedodesol/horizon-detail/${horizonId}`]);
  }

  goToHorizonEdit(horizonId?: number) {
    if (!horizonId) return;
    this.router.navigate([`/fiche-agropedodesol/horizon-edit/${horizonId}`]);
  }

  goToAddPhotosForHorizon(horizonId?: number) {
    if (!horizonId) return;
    this.router.navigate([`/fiche-agropedodesol/photo-create`], { queryParams: { horizon: horizonId } });
  }

  goToPhotoDetail(photoId?: number) {
    if (!photoId) return;
    this.router.navigate([`/fiche-agropedodesol/photo-detail/${photoId}`]);
  }

  goToHorizonCreateForFiche() {
    if (!this.fiche?.id) return;
    this.router.navigate([`/fiche-agropedodesol/horizon-create`], { queryParams: { fiche: this.fiche.id } });
  }

  async deleteHorizon(horizonId?: number) {
    if (!horizonId) return;
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
      await this.horizonService.remove(horizonId);
      this.horizons = (this.horizons || []).filter(h => +((h as any).id || 0) !== +horizonId);
      this.snackBar.open('Horizon supprimé', 'Fermer', { duration: 3000 });
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la suppression de l\'horizon.';
    }
  }

  print() {
    window.print();
  }
}
