import { Component, OnInit } from '@angular/core';
import { FichePhoto } from '../../../models/fiche-agropedodesol.model';
import { FichePhotoService } from '../../../services/ficheAgroPedoServcices/fiche-photo-service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-list',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './photo-list.component.html',
  styleUrl: './photo-list.component.css'
})
export class PhotoListComponent implements OnInit {
  photos: FichePhoto[] = [];
  loading = false;
  error: string | null = null;

  constructor(private photoService: FichePhotoService, private router: Router) {}

  async ngOnInit() {
    await this.loadPhotos();
  }

  async loadPhotos() {
    this.loading = true;
    this.error = null;
    try {
      this.photos = await this.photoService.getAll();
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors du chargement des photos.';
    }
    this.loading = false;
  }

  async deletePhoto(id: number) {
    if (!confirm('Supprimer cette photo ?')) return;
    this.loading = true;
    try {
      await this.photoService.delete(id);
      this.photos = this.photos.filter(p => p.id !== id);
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la suppression.';
    }
    this.loading = false;
  }

  goToDetail(id: number) {
    this.router.navigate([`/fiche-agropedodesol/photo-detail/${id}`]);
  }

  goToEdit(id: number) {
    this.router.navigate([`/fiche-agropedodesol/photo-edit/${id}`]);
  }
}
