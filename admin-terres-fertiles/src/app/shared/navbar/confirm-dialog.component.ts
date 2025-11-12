import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirmation' }}</h2>
    <mat-dialog-content>{{ data.message || 'Êtes-vous sûr de vouloir effectuer cette action ?' }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ data.cancelText || 'Annuler' }}</button>
      <button mat-raised-button [color]="data.color || 'warn'" [mat-dialog-close]="true">{{ data.confirmText || 'Confirmer' }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string; confirmText?: string; cancelText?: string; color?: 'warn'|'primary'|'accent' }) {}
}