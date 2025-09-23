import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MelangeModel } from '../planning/melange.model';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
// Update the import path if planning.service.ts is located elsewhere, for example:
import { PlanningService } from '../../services/planning/planning.service';
// Or adjust the path to match the correct location of planning.service.ts

@Component({
  selector: 'app-planning-form',
  templateUrl: './planning-form.component.html',
  styleUrls: ['./planning-form.component.css'],
  standalone: true,
  imports: [FormsModule],
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
  constructor(
    public dialogRef: MatDialogRef<PlanningFormComponent>,
    private service : PlanningService,
    @Inject(MAT_DIALOG_DATA) public data: { melange: MelangeModel }
  ) {
    this.melange = { ...data.melange };

  }

  onSave() {
    this.dialogRef.close(this.melange); // envoie les données au parent
  }
  onDelete() {
    if (confirm('Voulez-vous vraiment supprimer ce planning ?')) {
      this.service.deletePlanning(this.melange.id)
        .then(() => {
          // Fermer la modale avec un retour indiquant que suppression a eu lieu
          this.dialogRef.close('deleted');
        })
        .catch((error: any) => {
          console.error('Erreur lors de la suppression du planning:', error);
        });
    }
  }




  onCancel() {
    this.dialogRef.close(); // annule
  }
}
