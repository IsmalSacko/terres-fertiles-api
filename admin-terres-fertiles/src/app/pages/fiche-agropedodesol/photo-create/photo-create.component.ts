import { Component, OnInit } from '@angular/core';
import { FichePhoto } from '../../../models/fiche-agropedodesol.model';
import { FichePhotoService } from '../../../services/ficheAgroPedoServcices/fiche-photo-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-photo-create',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './photo-create.component.html',
  styleUrl: './photo-create.component.css'
})
export class PhotoCreateComponent implements OnInit {
  photo: Partial<FichePhoto> = {};
  loading = false;
  success = false;
  error: string | null = null;
  imageFile: File | null = null;
  horizonId: number | null = null;
  createdPhotos: any[] = [];

  constructor(
    private photoService: FichePhotoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  goToFicheList() {
    this.router.navigate(['/fiches-agro-pedologiques']);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['horizon']) {
        this.horizonId = +params['horizon'];
        this.photo.horizon = this.horizonId;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  async savePhoto() {
    if (!this.imageFile) {
      this.error = 'Veuillez sélectionner une image.';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const formData = new FormData();
      formData.append('image', this.imageFile);
      formData.append('type_photo', this.photo.type_photo || 'autre');
      formData.append('description', this.photo.description || '');
      if (this.photo.horizon) formData.append('horizon', String(this.photo.horizon));
      if (this.photo.fiche) formData.append('fiche', String(this.photo.fiche));
  const createdPhoto = await this.photoService.create(formData);
  this.success = true;
  // conserver la référence à la photo créée pour affichage sous le formulaire
  this.createdPhotos.unshift(createdPhoto);
  // réinitialiser le formulaire pour permettre un autre envoi
  const keepHorizon = this.photo.horizon || this.horizonId;
  const keepFiche = this.photo.fiche;
  this.photo = {};
  if (keepHorizon) this.photo.horizon = keepHorizon;
  if (keepFiche) this.photo.fiche = keepFiche;
  this.imageFile = null;
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de l\'enregistrement.';
    }
    this.loading = false;
  }
}
