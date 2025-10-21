import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FichePhoto } from '../../../models/fiche-agropedodesol.model';
import { FichePhotoService } from '../../../services/ficheAgroPedoServcices/fiche-photo-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-detail',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.css'
})
export class PhotoDetailComponent implements OnInit {
  photo: FichePhoto | null = null;
  loading = false;
  error: string | null = null;

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

  goBack() {
    this.router.navigate(['/fiche-agropedodesol/photos']);
  }

  goToEdit() {
    if (this.photo?.id) {
      this.router.navigate([`/fiche-agropedodesol/photo-edit/${this.photo.id}`]);
    }
  }
}
