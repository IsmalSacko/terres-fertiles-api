import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MelangeService, Melange, MelangeEtat } from '../../../services/melange.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-melange-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './melange-list.component.html',
  styleUrl: './melange-list.component.css'
})
export class MelangeListComponent implements OnInit {
  melanges: Melange[] = [];
  loading = true;
  error = '';
  selectedMelangeId: number | null = null;
  constructor(private melangeService: MelangeService, private authSrvice: AuthService) {}

  ngOnInit(): void {
    this.loadMelanges();
  }
 

  toggleAmendementForm(melangeId: number): void {
    this.selectedMelangeId = this.selectedMelangeId === melangeId ? null : melangeId;
  }
  
  async loadMelanges(): Promise<void> {
    try {
      this.loading = true;
      const currentUser = await this.authSrvice.getCurrentUser();
      if (!currentUser){
      // INSERT_YOUR_CODE
      // Rediriger vers la page de login si aucun utilisateur n'est connecté
      window.location.href = '/login';
      

      }else{

        this.melanges = await this.melangeService.getAll();
      }
    } catch (err) {
      this.error = 'Erreur lors du chargement des mélanges';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  getEtatLabel(etat: MelangeEtat): string {
    return this.melangeService.getEtatLabel(etat);
  }

  getEtatColor(etat: MelangeEtat): string {
    return this.melangeService.getEtatColor(etat);
  }

  getTacheActuelle(etat: MelangeEtat): string {
    return this.melangeService.getTacheActuelle(etat);
  }

  getProgressPercentage(etat: MelangeEtat): number {
    return (etat / 6) * 100;
  }

  async previousStep(melange: Melange): Promise<void> {
    if (melange.etat > 1 && melange.id) {
      try {
        await this.melangeService.updateEtat(melange.id, melange.etat - 1);
        await this.loadMelanges();
      } catch (err) {
        console.error('Erreur lors du changement d\'état:', err);
      }
    }
  }

  async nextStep(melange: Melange): Promise<void> {
    if (melange.etat < 6 && melange.id) {
      try {
        await this.melangeService.updateEtat(melange.id, melange.etat + 1);
        await this.loadMelanges();
      } catch (err) {
        console.error('Erreur lors du changement d\'état:', err);
      }
    }
  }
}
