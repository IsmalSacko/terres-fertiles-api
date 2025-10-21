import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FichePhoto } from '../../../models/fiche-agropedodesol.model';
import { FichePhotoService } from '../../../services/ficheAgroPedoServcices/fiche-photo-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-photo-edit',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './photo-edit.component.html',
  styleUrl: './photo-edit.component.css'
})
export class PhotoEditComponent implements OnInit {
  photo: Partial<FichePhoto> = {};
  loading = false;
  error: string | null = null;
  success = false;
  imageFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: FichePhotoService
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Identifiant de photo invalide.';
      return;
    }
    this.loading = true;
    try {
      this.photo = await this.photoService.get(id);
    } catch (e: any) {
      this.error = e?.message || 'Photo introuvable.';
    }
    this.loading = false;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
    }
  }

  async savePhoto() {
    this.loading = true;
    this.error = null;
    try {
      let formData: FormData | Partial<FichePhoto>;
      if (this.imageFile) {
        formData = new FormData();
        formData.append('image', this.imageFile);
        formData.append('type_photo', this.photo.type_photo || 'autre');
        formData.append('description', this.photo.description || '');
        if (this.photo.horizon) formData.append('horizon', String(this.photo.horizon));
        if (this.photo.fiche) formData.append('fiche', String(this.photo.fiche));
      } else {
        formData = {
          type_photo: this.photo.type_photo,
          description: this.photo.description,
          horizon: this.photo.horizon,
          fiche: this.photo.fiche
        };
      }
      await this.photoService.update(Number(this.photo.id), formData);
      this.success = true;
      // Redirection ou autre logique après succès
      this.router.navigate(['/fiche-agropedodesol/photo-detail', this.photo.id]);
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la modification.';
    }
    this.loading = false;
  }

  goBack() {
    this.router.navigate(['/fiche-agropedodesol/photo-detail', this.photo.id]);
  }
}
