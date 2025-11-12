import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import axios from 'axios';
import { environment } from '../../../../environments/environment';

interface EditChantierData {
  id: number;
  nom: string;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
}

@Component({
  selector: 'app-edit-chantier-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <h2 mat-dialog-title>Modifier l'origine (chantier)</h2>
  <div mat-dialog-content>
    <div class="form-grid">
      <mat-form-field appearance="outline">
        <mat-label>Nom (lecture seule)</mat-label>
        <input matInput [value]="data.nom" disabled>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Localisation</mat-label>
        <input matInput [(ngModel)]="localisation" placeholder="Ex: BRON PARILLY">
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Latitude</mat-label>
        <input matInput type="number" [(ngModel)]="latitude">
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Longitude</mat-label>
        <input matInput type="number" [(ngModel)]="longitude">
      </mat-form-field>
    </div>
    <p class="hint">Le nom du chantier est généré automatiquement côté serveur en fonction des métadonnées. Vous pouvez mettre à jour la localisation et les coordonnées.</p>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button (click)="close(false)">Annuler</button>
    <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">Sauvegarder</button>
  </div>
  `,
  styles: [`
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hint { font-size: 12px; color: #666; margin-top: 8px; }
  `]
})
export class EditChantierDialogComponent {
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  saving = false;

  private apiUrl = environment.apiUrl + '/chantiers/';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: EditChantierData,
    private dialogRef: MatDialogRef<EditChantierDialogComponent>
  ) {
    this.localisation = data.localisation;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Token ${token}` } };
  }

  close(saved: boolean) {
    this.dialogRef.close({ saved });
  }

  async save() {
    this.saving = true;
    try {
      await axios.patch(
        `${this.apiUrl}${this.data.id}/`,
        {
          localisation: this.localisation,
          latitude: this.latitude,
          longitude: this.longitude,
        },
        this.getHeaders()
      );
      this.close(true);
    } catch (e) {
      console.error('Erreur de mise à jour du chantier', e);
      this.saving = false;
    }
  }
}
