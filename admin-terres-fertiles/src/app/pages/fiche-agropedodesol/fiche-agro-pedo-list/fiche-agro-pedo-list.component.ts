import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FicheAgroPedodeSol } from '../../../models/fiche-agropedodesol.model';
import { FicheAgroService } from '../../../services/ficheAgroPedoServcices/fiche-agro-pedo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fiche-agro-pedo-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './fiche-agro-pedo-list.component.html',
  styleUrls: ['./fiche-agro-pedo-list.component.css']
})
export class FicheAgroPedoListComponent implements OnInit {
  fiches: FicheAgroPedodeSol[] = [];
  loading = false;
  error: string | null = null;

  constructor(private ficheService: FicheAgroService, private router: Router) {}

  ngOnInit(): void {
    this.loadFiches();
  }

  async loadFiches() {
    this.loading = true;
    this.error = null;
    try {
      this.fiches = await this.ficheService.getAll();
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors du chargement des fiches.';
    }
    this.loading = false;
  }

  goToDetail(id?: number) {
    if (!id) return;
    this.router.navigate([`/fiches-agro-pedologiques/${id}`]);
  }

  goToEdit(id?: number) {
    if (!id) return;
    this.router.navigate([`/fiches-agro-pedologiques/${id}/edit`]);
  }

  async deleteFiche(id?: number) {
    if (!id) return;
    if (!confirm('Supprimer cette fiche ?')) return;
    this.loading = true;
    try {
      await this.ficheService.delete(id);
      this.fiches = this.fiches.filter(f => f.id !== id);
    } catch (e: any) {
      this.error = e?.message || 'Erreur lors de la suppression.';
    }
    this.loading = false;
  }
}
