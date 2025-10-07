import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
  title: string;
  message: string;
  itemName?: string;
  deleteText?: string;
  cancelText?: string;
  dangerous?: boolean;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-delete-dialog">
      <div class="dialog-icon" [class.dangerous]="data.dangerous">
        <mat-icon>{{data.dangerous ? 'warning' : 'help_outline'}}</mat-icon>
      </div>
      
      <h1 mat-dialog-title>{{data.title}}</h1>
      
      <div mat-dialog-content>
        <p>{{data.message}}</p>
        <div class="item-highlight" *ngIf="data.itemName">
          <strong>{{data.itemName}}</strong>
        </div>
        <p class="warning-text" *ngIf="data.dangerous">
          <mat-icon>warning</mat-icon>
          Cette action est irréversible.
        </p>
      </div>
      
      <div mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{data.cancelText || 'Annuler'}}
        </button>
        <button 
          mat-raised-button 
          [color]="data.dangerous ? 'warn' : 'primary'"
          (click)="onConfirm()">
          <mat-icon>{{data.dangerous ? 'delete_forever' : 'check'}}</mat-icon>
          {{data.deleteText || 'Confirmer'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-delete-dialog {
      text-align: center;
      padding: 8px;
    }

    .dialog-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: #e3f2fd;
      color: #1976d2;
    }

    .dialog-icon.dangerous {
      background: #ffebee;
      color: #f44336;
    }

    .dialog-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    h1 {
      margin-bottom: 16px;
      color: #333;
    }

    .item-highlight {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
      margin: 16px 0;
      text-align: left;
    }

    .warning-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #f44336;
      font-weight: 500;
      margin-top: 16px;
    }

    .warning-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    [mat-dialog-actions] {
      margin-top: 24px;
      gap: 12px;
    }

    [mat-dialog-actions] button {
      min-width: 100px;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}