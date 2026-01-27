import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MelangeModel } from '../planning/melange.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Update the import path if planning.service.ts is located elsewhere, for example:
import { PlanningService } from '../../services/planning/planning.service';
// Or adjust the path to match the correct location of planning.service.ts

@Component({
  selector: 'app-planning-form',
  templateUrl: './planning-form.component.html',
  styleUrls: ['./planning-form.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class PlanningFormComponent {

  melange!: {
    id: number;
    titre: string;
    date_debut: string;
    duree_jours: number;
    statut: string;
    melange: number;
    melange_nom: string
  };
  existingItems: MelangeModel[] = [];
  selectedToDelete = new Set<number>();

  constructor(
    public dialogRef: MatDialogRef<PlanningFormComponent>,
    private service : PlanningService,
    @Inject(MAT_DIALOG_DATA) public data: { melange: MelangeModel, existingItems?: MelangeModel[] }
  ) {
    this.melange = { ...data.melange };
    if (data.existingItems && Array.isArray(data.existingItems)) {
      this.existingItems = data.existingItems.map(it => ({ ...it }));
    }

  }

  onSave() {
    this.dialogRef.close(this.melange); // envoie les données au parent (création ou mise à jour)
  }
  onDelete() {
    if (!this.melange.id || this.melange.id === 0) {
      // Rien à supprimer si création en cours
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
      this.service.deletePlanning(this.melange.id)
        .then(() => {
          this.dialogRef.close('deleted');
        })
        .catch((error: any) => {
          console.error('Erreur lors de la suppression du planning:', error);
        });
    }
  }

  // Basculer la sélection pour suppression multiple
  toggleSelect(id: number) {
    if (this.selectedToDelete.has(id)) this.selectedToDelete.delete(id);
    else this.selectedToDelete.add(id);
  }

  // Supprimer les plannings sélectionnés
  async deleteSelected() {
    if (this.selectedToDelete.size === 0) return;
    if (!confirm('Supprimer les interventions sélectionnées ?')) return;
    try {
      for (const id of Array.from(this.selectedToDelete)) {
        await this.service.deletePlanning(id);
      }
      this.dialogRef.close('deleted');
    } catch (err) {
      console.error('Erreur suppression multiple:', err);
    }
  }

  // Préparer l'édition d'une intervention existante
  editItem(item: MelangeModel) {
    this.melange = { ...item };
  }




  onCancel() {
    this.dialogRef.close(); // annule
  }
}
