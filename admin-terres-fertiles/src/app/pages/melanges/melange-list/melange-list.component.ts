import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MelangeService, Melange, MelangeEtat } from '../../../services/melange.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-melange-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  getEtatLabelShort(etat: MelangeEtat): string {
    return this.melangeService.getEtatLabelShort(etat);
  }

  getEtatColor(etat: MelangeEtat): string {
    return this.melangeService.getEtatColor(etat);
  }

  getTacheActuelle(etat: MelangeEtat): string {
    return this.melangeService.getTacheActuelle(etat);
  }



  getProgressPercentageFormatted(melange: Melange): string {
    let percentage: number;
    
    if (melange.etat === 1) {
      // Calculer le pourcentage total des gisements sélectionnés
      percentage = this.getTotalSelectedPercentage(melange);
    } else {
      // Progression basée sur l'état (comme dans le détail)
      percentage = (melange.etat! / 6) * 100;
    }
    
    return `${Math.round(percentage)}%`;
  }

  getTotalSelectedPercentage(melange: Melange): number {
    if (!melange.ingredients) return 0;
    return melange.ingredients.reduce((sum, ingredient) => sum + (Number(ingredient.pourcentage) || 0), 0);
  }

  getProgressPercentage(melange: Melange): number {
    if (melange.etat === 1) {
      // Calculer le pourcentage total des gisements sélectionnés
      return this.getTotalSelectedPercentage(melange);
    } else {
      // Progression basée sur l'état (comme dans le détail)
      return (melange.etat! / 6) * 100;
    }
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
  async deleteMelange(melangeId: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Supprimer le mélange ?',
      text: 'Cette action est irréversible. Voulez-vous vraiment supprimer ce mélange ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });
    if (result.isConfirmed) {
      try {
        await this.melangeService.delete(melangeId);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le mélange a bien été supprimé.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
        await this.loadMelanges();
      } catch (err) {
        console.error('Erreur lors de la suppression du mélange:', err);
        await Swal.fire({
          title: 'Erreur',
          text: 'La suppression a échoué.',
          icon: 'error'
        });
      }
    }
  }
}
