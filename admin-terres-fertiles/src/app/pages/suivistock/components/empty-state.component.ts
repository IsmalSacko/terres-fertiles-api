import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="empty-state" [class]="containerClass">
      <div class="empty-content">
        <div class="empty-icon" [class]="iconClass">
          <mat-icon>{{icon}}</mat-icon>
        </div>
        
        <div class="empty-text">
          <h3>{{title}}</h3>
          <p>{{message}}</p>
          <div class="empty-details" *ngIf="details">
            <small>{{details}}</small>
          </div>
        </div>
        
        <div class="empty-actions" *ngIf="showActions">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onPrimaryAction()"
            *ngIf="primaryActionText">
            <mat-icon *ngIf="primaryActionIcon">{{primaryActionIcon}}</mat-icon>
            {{primaryActionText}}
          </button>
          
          <button 
            mat-stroked-button 
            (click)="onSecondaryAction()"
            *ngIf="secondaryActionText">
            <mat-icon *ngIf="secondaryActionIcon">{{secondaryActionIcon}}</mat-icon>
            {{secondaryActionText}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      min-height: 300px;
      text-align: center;
    }

    .empty-state.compact {
      padding: 40px 20px;
      min-height: 200px;
    }

    .empty-state.fullheight {
      min-height: 60vh;
    }

    .empty-content {
      max-width: 400px;
      width: 100%;
    }

    .empty-icon {
      margin-bottom: 24px;
    }

    .empty-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .empty-icon.primary mat-icon {
      color: #1976d2;
    }

    .empty-icon.secondary mat-icon {
      color: #666;
    }

    .empty-icon.success mat-icon {
      color: #4caf50;
    }

    .empty-icon.warning mat-icon {
      color: #ff9800;
    }

    .empty-icon.error mat-icon {
      color: #f44336;
    }

    .empty-text h3 {
      margin: 0 0 12px 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
    }

    .empty-text p {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 16px;
      line-height: 1.5;
    }

    .empty-details {
      margin-bottom: 24px;
    }

    .empty-details small {
      color: #888;
      font-size: 14px;
      font-style: italic;
    }

    .empty-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .empty-actions button {
      min-width: 160px;
    }

    .empty-actions button mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Responsive */
    @media (min-width: 480px) {
      .empty-actions {
        flex-direction: row;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .empty-state {
        padding: 40px 16px;
        min-height: 250px;
      }

      .empty-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .empty-text h3 {
        font-size: 1.3rem;
      }

      .empty-text p {
        font-size: 14px;
      }

      .empty-actions button {
        min-width: 140px;
        width: 100%;
        max-width: 200px;
      }
    }

    /* Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .empty-content {
      animation: fadeInUp 0.3s ease-out;
    }

    .empty-icon {
      animation: fadeInUp 0.4s ease-out;
    }

    .empty-text {
      animation: fadeInUp 0.5s ease-out;
    }

    .empty-actions {
      animation: fadeInUp 0.6s ease-out;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Aucune donnée';
  @Input() message = 'Il n\'y a rien à afficher pour le moment.';
  @Input() details?: string;
  @Input() icon = 'inbox';
  @Input() iconClass: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'default';
  @Input() containerClass: 'default' | 'compact' | 'fullheight' = 'default';
  @Input() showActions = true;
  @Input() primaryActionText?: string;
  @Input() primaryActionIcon?: string;
  @Input() secondaryActionText?: string;
  @Input() secondaryActionIcon?: string;

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }
}